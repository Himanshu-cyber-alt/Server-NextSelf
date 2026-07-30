import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
 user: 'postgres',
  host: 'localhost',
  database : 'Addict',
  password: 'Hemant@786',
  port: 5432, // Default PostgreSQL port
});

export default pool;