import express from 'express';
import cors from 'cors';
import pool from './db.js';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const BORDERPAY_API_KEY = process.env.BORDERPAY_API_KEY || 'Bp_test_bsF3Wj5HQNGzZm0fHbS5Vcm_05GfupXV';
const BORDERPAY_BASE_URL = 'https://borderpay.id/api/v1';
const BORDERPAY_WEBHOOK_TOKEN = process.env.BORDERPAY_WEBHOOK_TOKEN || '';

const TIER_LIMITS = {
  free: 1,
  bronze: 3,
  gold: 5,
  platinum: 10,
};

const TIER_PRICES = {
  bronze: 15000,
  gold: 25000,
  platinum: 45000,
};

// Helper to check & reset daily count if date changed
async function getOrSyncUser(userId, email, name, avatar) {
  const today = new Date().toISOString().split('T')[0];
  
  const checkUser = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  
  if (checkUser.rows.length === 0) {
    const newUser = await pool.query(
      `INSERT INTO users (id, email, name, avatar, plan, daily_exports_count, last_export_date)
       VALUES ($1, $2, $3, $4, 'free', 0, $5)
       RETURNING *`,
      [userId, email, name, avatar, today]
    );
    return newUser.rows[0];
  }

  let user = checkUser.rows[0];
  const userLastDate = user.last_export_date ? new Date(user.last_export_date).toISOString().split('T')[0] : '';
  
  if (userLastDate !== today) {
    const updated = await pool.query(
      `UPDATE users SET daily_exports_count = 0, last_export_date = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [today, userId]
    );
    user = updated.rows[0];
  }

  return user;
}

// ====== PAYMENT API ROUTES ======

// Create payment session for subscription upgrade
app.post('/api/payment/create', async (req, res) => {
  try {
    const { userId, plan } = req.body;
    if (!userId || !plan) {
      return res.status(400).json({ error: 'userId and plan are required' });
    }

    const price = TIER_PRICES[plan];
    if (!price) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const referenceId = `AU-${plan.toUpperCase()}-${Date.now()}-${userId.slice(0, 6)}`;

    // Create payment session with BorderPay
    const borderpayRes = await fetch(`${BORDERPAY_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BORDERPAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: price,
        reference_id: referenceId,
        method: 'qris'
      })
    });

    const borderpayData = await borderpayRes.json();
    if (!borderpayRes.ok) {
      console.error('BorderPay error:', borderpayData);
      return res.status(500).json({ error: 'Failed to create payment' });
    }

    // Save to database
    await pool.query(
      `INSERT INTO transactions (id, reference_id, user_id, plan, amount, status, pay_url, qr_string)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7)`,
      [borderpayData.id, referenceId, userId, plan, price, borderpayData.pay_url, borderpayData.qr_string]
    );

    return res.json({
      success: true,
      referenceId,
      payUrl: borderpayData.pay_url,
      qrString: borderpayData.qr_string,
      amount: price
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Check payment status
app.get('/api/payment/status/:referenceId', async (req, res) => {
  try {
    const { referenceId } = req.params;

    // Check our database first
    const dbRes = await pool.query('SELECT * FROM transactions WHERE reference_id = $1', [referenceId]);
    if (dbRes.rows.length > 0) {
      const tx = dbRes.rows[0];
      // Sync with BorderPay if still pending
      if (tx.status === 'pending') {
        const borderpayRes = await fetch(`${BORDERPAY_BASE_URL}/payments/${referenceId}`, {
          headers: { 'Authorization': `Bearer ${BORDERPAY_API_KEY}` }
        });
        const borderpayData = await borderpayRes.json();
        
        if (borderpayData.status === 'paid' || borderpayData.status === 'expired') {
          await pool.query(
            `UPDATE transactions SET status = $1 WHERE reference_id = $2`,
            [borderpayData.status, referenceId]
          );
          return res.json({ ...tx, status: borderpayData.status });
        }
      }
      return res.json(tx);
    }

    // Fallback to BorderPay
    const borderpayRes = await fetch(`${BORDERPAY_BASE_URL}/payments/${referenceId}`, {
      headers: { 'Authorization': `Bearer ${BORDERPAY_API_KEY}` }
    });
    const borderpayData = await borderpayRes.json();
    
    if (!borderpayRes.ok) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    return res.json(borderpayData);
  } catch (err) {
    console.error('Payment status error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ====== USER ROUTES ======

app.post('/api/auth/google', async (req, res) => {
  try {
    const { id, email, name, avatar } = req.body;
    if (!email || !id) {
      return res.status(400).json({ error: 'Missing user credentials' });
    }

    const user = await getOrSyncUser(id, email, name, avatar);
    const limit = TIER_LIMITS[user.plan] || 1;
    const remaining = Math.max(0, limit - user.daily_exports_count);

    // Check for active subscriptions that need upgrade
    const activeTx = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 AND status = 'pending' AND created_at > NOW() - INTERVAL '30 minutes'
       ORDER BY created_at DESC LIMIT 1`,
      [id]
    );

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan,
        dailyExportsCount: user.daily_exports_count,
        dailyLimit: limit,
        remainingExports: remaining,
      },
      pendingPayment: activeTx.rows.length > 0 ? {
        referenceId: activeTx.rows[0].reference_id,
        payUrl: activeTx.rows[0].pay_url,
        amount: activeTx.rows[0].amount
      } : null
    });
  } catch (err) {
    console.error('Auth Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let user = userRes.rows[0];
    const today = new Date().toISOString().split('T')[0];
    const userLastDate = user.last_export_date ? new Date(user.last_export_date).toISOString().split('T')[0] : '';
    
    if (userLastDate !== today) {
      const updated = await pool.query(
        `UPDATE users SET daily_exports_count = 0, last_export_date = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [today, id]
      );
      user = updated.rows[0];
    }

    const limit = TIER_LIMITS[user.plan] || 1;
    const remaining = Math.max(0, limit - user.daily_exports_count);

    // Check for pending payment
    const activeTx = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 AND status = 'pending' AND created_at > NOW() - INTERVAL '30 minutes'
       ORDER BY created_at DESC LIMIT 1`,
      [id]
    );

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      plan: user.plan,
      dailyExportsCount: user.daily_exports_count,
      dailyLimit: limit,
      remainingExports: remaining,
      pendingPayment: activeTx.rows.length > 0 ? {
        referenceId: activeTx.rows[0].reference_id,
        payUrl: activeTx.rows[0].pay_url,
        amount: activeTx.rows[0].amount
      } : null
    });
  } catch (err) {
    console.error('User Fetch Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/user/upgrade', async (req, res) => {
  try {
    const { userId, plan } = req.body;
    if (!['bronze', 'gold', 'platinum'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const updated = await pool.query(
      `UPDATE users SET plan = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [plan, userId]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = updated.rows[0];
    const limit = TIER_LIMITS[user.plan] || 1;
    const remaining = Math.max(0, limit - user.daily_exports_count);

    return res.json({
      message: `Berhasil upgrade ke paket ${plan.toUpperCase()}!`,
      user: {
        id: user.id,
        plan: user.plan,
        dailyLimit: limit,
        remainingExports: remaining
      }
    });
  } catch (err) {
    console.error('Upgrade Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/export/record', async (req, res) => {
  try {
    const { userId, projectId, type } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const today = new Date().toISOString().split('T')[0];
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let user = userRes.rows[0];
    const userLastDate = user.last_export_date ? new Date(user.last_export_date).toISOString().split('T')[0] : '';
    
    let currentCount = user.daily_exports_count;
    if (userLastDate !== today) {
      currentCount = 0;
    }

    const limit = TIER_LIMITS[user.plan] || 1;
    if (currentCount >= limit) {
      return res.status(403).json({
        error: `Batas export harian untuk paket ${user.plan.toUpperCase()} (${limit}x/hari) sudah tercapai. Upgrade paket untuk export lebih banyak!`,
        reachedLimit: true,
        dailyLimit: limit,
        dailyExportsCount: currentCount,
        plan: user.plan
      });
    }

    const nextCount = currentCount + 1;
    await pool.query(
      `UPDATE users SET daily_exports_count = $1, last_export_date = $2, updated_at = NOW() WHERE id = $3`,
      [nextCount, today, userId]
    );

    await pool.query(
      `INSERT INTO export_logs (user_id, project_id, type) VALUES ($1, $2, $3)`,
      [userId, projectId || 'untitled', type || 'whatsapp']
    );

    return res.json({
      success: true,
      dailyExportsCount: nextCount,
      dailyLimit: limit,
      remainingExports: Math.max(0, limit - nextCount)
    });
  } catch (err) {
    console.error('Export Record Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ====== PROJECTS ROUTES ======

app.get('/api/projects', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const result = await pool.query(
      'SELECT id, title, type, data, created_at, updated_at FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    res.json({ projects: result.rows });
  } catch (err) {
    console.error('Fetch Projects Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { id, userId, title, type, data } = req.body;
    if (!userId || !title || !type || !data) {
      return res.status(400).json({ error: 'Incomplete project payload' });
    }

    const projectId = id || `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const upsertRes = await pool.query(
      `INSERT INTO projects (id, user_id, title, type, data, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (id) DO UPDATE 
       SET title = $3, type = $4, data = $5, updated_at = NOW()
       RETURNING *`,
      [projectId, userId, title, type, JSON.stringify(data)]
    );

    res.json({ success: true, project: upsertRes.rows[0] });
  } catch (err) {
    console.error('Save Project Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId;
    await pool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete Project Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ====== AI SCRIPT GENERATOR ======

app.post('/api/ai/generate', (req, res) => {
  try {
    const { prompt, theme = 'romance', characterA = 'Me', characterB = 'Partner' } = req.body;
    
    const templates = {
      romance: [
        `[B]: Kamu masih di perpus ya?
[A]: Iya nih, belum selesai ngerangkum materi buat kuis besok :(
[B]: Mau martabak coklat keju ga? Aku sekalian lewat nih.
[A]: EH SERIUSAN? 😭 mauu bangeett, jangan bayar yaa
[B]: Ga usah bayar. Turun ke lobby 5 menit lagi ya, dingin di luar.
[A]: OTW LOBBY KAK! Makasih banyaaakk ❤️`,
        `[B]: Jangan tidur malem-malem terus, ntar sakit lagi kayak minggu lalu.
[A]: Tanggung ini dikit lagi selesai kok!
[B]: Dikit lagi apa jam 2 pagi? Pokoknya 10 menit lagi harus udah matiin laptop.
[A]: Iyaa bawel bgt sih wkwk 🙈
[B]: Demi kebaikan kamu juga. Besok pagi aku jemput jam 7 ya.
[A]: Siap kapten! 🫡`
      ],
      dosen: [
        `[B]: Selamat malam, tugas laporan bab 3 kamu sudah saya review.
[A]: Malam Pak. Ada yang perlu saya revisi banyak ya Pak?
[B]: Hanya perbaiki metodologi di halaman 14. Besok jam 10 bawa printoutnya ke ruangan saya.
[A]: Baik Pak, terima kasih banyak atas masukannya 🙏
[B]: Jangan begadang lagi, saya lihat kantung mata kamu pas bimbingan tadi.
[A]: Eh.. Iya siap Pak, terima kasih perhatiannya.`
      ],
      idol: [
        `[B]: Sst, aku baru aja selesai recording lagu baru.
[A]: Gimana capek ga hari ini? Jangan lupa minum vitaminnya!
[B]: Lumayan, tapi pas dapet chat dari kamu langsung ilang capeknya haha.
[A]: Dih gombal mulu ya kamu 😤
[B]: Beneran tau. Nanti pas comeback stage, kamu dateng kan?
[A]: Pasti dong! Baris paling depan pegang banner nama kamu ❤️`
      ],
      toxic_ex: [
        `[B]: Kamu lagi dimana?
[A]: Ada apa ya? Kita udah ga ada urusan lagi.
[B]: Aku kangen, kita bisa ngobrol sebentar aja ga? Aku di depan rumah kamu.
[A]: Tolong pulang sekarang. Jangan bikin semuanya makin ribet.
[B]: Sekali aja dengerin penjelasan aku...
[A]: Udah cukup. Tolong hargai keputusan aku.`
      ]
    };

    const selectedPool = templates[theme] || templates.romance;
    const randomScript = selectedPool[Math.floor(Math.random() * selectedPool.length)];

    return res.json({
      script: randomScript
    });
  } catch (err) {
    res.status(500).json({ error: 'AI generation error' });
  }
});

// ====== BORDERPAY WEBHOOK ======

app.post('/api/webhook/borderpay', async (req, res) => {
  try {
    const event = req.headers['x-borderpay-event'];
    const token = req.headers['x-borderpay-token'];
    
    // Verify webhook token
    if (BORDERPAY_WEBHOOK_TOKEN && token !== BORDERPAY_WEBHOOK_TOKEN) {
      console.log('Webhook token mismatch');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const { reference_id, status, amount } = data;
    
    if (!reference_id || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`Webhook received: ${event} for ${reference_id}, status: ${status}`);

    if (status === 'paid') {
      // Update transaction status
      await pool.query(
        `UPDATE transactions SET status = 'paid', updated_at = NOW() 
         WHERE reference_id = $1`,
        [reference_id]
      );

      // Extract user ID and plan from reference_id (format: AU-{PLAN}-{TIMESTAMP}-{USERID})
      const parts = reference_id.split('-');
      if (parts.length >= 4 && parts[0] === 'AU') {
        const plan = parts[1].toLowerCase();
        const userId = parts[3];
        
        if (TIER_LIMITS[plan]) {
          // Update user plan
          await pool.query(
            `UPDATE users SET plan = $1, updated_at = NOW() WHERE id = $2`,
            [plan, userId]
          );
          
          console.log(`User ${userId} upgraded to ${plan} plan`);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
