import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const TIER_LIMITS = {
  free: 1,
  bronze: 3,
  gold: 5,
  platinum: 10,
};

// Helper to check & reset daily count if date changed
async function getOrSyncUser(userId, email, name, avatar) {
  const today = new Date().toISOString().split('T')[0];
  
  // Find or create user
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

// 1. AUTH / GOOGLE SYNC
app.post('/api/auth/google', async (req, res) => {
  try {
    const { id, email, name, avatar } = req.body;
    if (!email || !id) {
      return res.status(400).json({ error: 'Missing user credentials' });
    }

    const user = await getOrSyncUser(id, email, name, avatar);
    const limit = TIER_LIMITS[user.plan] || 1;
    const remaining = Math.max(0, limit - user.daily_exports_count);

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
      }
    });
  } catch (err) {
    console.error('Auth Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. GET USER PROFILE & QUOTA
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

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      plan: user.plan,
      dailyExportsCount: user.daily_exports_count,
      dailyLimit: limit,
      remainingExports: remaining,
    });
  } catch (err) {
    console.error('User Fetch Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. UPGRADE SUBSCRIPTION TIER
app.post('/api/user/upgrade', async (req, res) => {
  try {
    const { userId, plan } = req.body;
    if (!['free', 'bronze', 'gold', 'platinum'].includes(plan)) {
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

// 4. CHECK & RECORD EXPORT QUOTA
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

    // Increment count & record log
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

// 5. PROJECTS CRUD
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

    // Upsert project
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

// 6. AI SCRIPT GENERATOR FOR AU STORIES
app.post('/api/ai/generate', (req, res) => {
  try {
    const { prompt, theme = 'romance', characterA = 'Me', characterB = 'Partner' } = req.body;
    
    // Curated Indonesian AU Story Templates Generator based on theme/prompt
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

export default app;
