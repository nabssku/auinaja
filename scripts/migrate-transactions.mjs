import pg from 'pg';

const connectionString = "postgresql://neondb_owner:npg_qa5pCLYy7Zun@ep-shiny-cherry-b3yc88bj-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log("Connected to Neon DB for transactions migration...");

  await client.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(255) PRIMARY KEY,
      reference_id VARCHAR(255) UNIQUE NOT NULL,
      user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
      plan VARCHAR(50) NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'paid' | 'expired' | 'failed'
      pay_url TEXT,
      qr_string TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Transactions table created successfully!");
  await client.end();
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
