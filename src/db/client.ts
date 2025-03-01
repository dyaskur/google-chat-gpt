import {Pool} from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables')
}

const pool = new Pool({connectionString: process.env.DATABASE_URL})

export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

export async function disconnectDB() {
  await pool.end()
  console.log('Disconnected from PostgreSQL')
}

export default pool
