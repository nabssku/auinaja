import pg from 'pg';

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_qa5pCLYy7Zun@ep-shiny-cherry-b3yc88bj-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

export default pool;
