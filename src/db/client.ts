import { Client } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the environment variables");
}

const client = new Client(process.env.DATABASE_URL);

export async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await client.end();
  console.log("Disconnected from PostgreSQL");
}

export default client;
