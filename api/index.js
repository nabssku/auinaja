import express from 'express';
import cors from 'cors';
import pool from '../server/db.js';

const app = express();
app.use(cors());
app.use(express.json());

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

// Helper sync user
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

// Router that supports both /api/* and /* paths depending on how Vercel rewrites it
const router = express.Router();

router.post(['/auth/google', '/api/auth/google'], async (req, res) => {
  try {
    const { id, email, name, avatar } = req.body;
    if (!email || !id) {
      return res.status(400).json({ error: 'Missing user credentials' });
    }

    const user = await getOrSyncUser(id, email, name, avatar);
    const limit = TIER_LIMITS[user.plan] || 1;
    const remaining = Math.max(0, limit - user.daily_exports_count);

    return res.json({
      success: true,
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
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

router.get(['/user/:id', '/api/user/:id'], async (req, res) => {
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
      remainingExports: remaining
    });
  } catch (err) {
    console.error('User Fetch Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

router.post(['/user/upgrade', '/api/user/upgrade'], async (req, res) => {
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
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

router.post(['/export/record', '/api/export/record'], async (req, res) => {
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
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

router.get(['/projects', '/api/projects'], async (req, res) => {
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
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

router.post(['/projects', '/api/projects'], async (req, res) => {
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
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

router.delete(['/projects/:id', '/api/projects/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId;
    await pool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete Project Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// BorderPay payment create
router.post(['/payment/create', '/api/payment/create'], async (req, res) => {
  try {
    const { userId, plan } = req.body;
    const price = TIER_PRICES[plan];
    if (!price) return res.status(400).json({ error: 'Invalid plan' });

    const referenceId = `AU-${plan.toUpperCase()}-${Date.now()}-${userId.slice(0, 6)}`;

    const borderpayRes = await fetch(`https://borderpay.id/api/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BORDERPAY_API_KEY || 'bp_test_bsF3Wj5HQNGzZm0fHbS5Vcm_05GfupXV'}`,
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
      return res.status(500).json({ error: 'Failed to create payment' });
    }

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
    console.error('Payment Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use(router);

export default (req, res) => {
  return app(req, res);
};
