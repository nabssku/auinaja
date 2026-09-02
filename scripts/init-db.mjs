import pg from 'pg';

const connectionString = "postgresql://neondb_owner:npg_qa5pCLYy7Zun@ep-shiny-cherry-b3yc88bj-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log("Connected to Neon DB successfully!");

  // Create Users Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      avatar TEXT,
      plan VARCHAR(50) DEFAULT 'free', -- 'free', 'bronze', 'gold', 'platinum'
      daily_exports_count INT DEFAULT 0,
      last_export_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Projects / Cerita Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL, -- 'whatsapp' | 'twitter'
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Export Logs Table (to verify daily limit by story/export)
  await client.query(`
    CREATE TABLE IF NOT EXISTS export_logs (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
      project_id VARCHAR(255),
      type VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Database tables initialized successfully!");
  await client.end();
}

main().catch(err => {
  console.error("DB Error:", err);
  process.exit(1);
});
