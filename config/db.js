import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

console.log("DATABASE_URL =", process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});