import { Client, Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const POSTGRES_URL = process.env.POSTGRES_URL!;
const MAIN_DB = process.env.MAIN_DB!;

export const createDatabase = async (dbName: string) => {
  const client = new Client({ connectionString: POSTGRES_URL });
  try {
    await client.connect();
    const checkDb = await client.query(`SELECT 1 FROM pg_database WHERE datname=$1`, [dbName]);
    if (checkDb.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database Created`);
    } else {
      console.log(`🔥 Database Connected`);
    }
  } catch (err) {
    console.error('❌ Error creating database:', err);
  } finally {
    await client.end();
  }
};

export const pool = new Pool({
  connectionString: MAIN_DB,
});

process.on('SIGINT', async () => {
  await pool.end();
  console.log('Database pool closed');
  process.exit(0);
});
