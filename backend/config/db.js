require("dotenv").config();

const { Pool } = require("pg");

console.log("========== DATABASE CONFIG ==========");
console.log("DB_HOST :", process.env.DB_HOST);
console.log("DB_PORT :", process.env.DB_PORT);
console.log("DB_NAME :", process.env.DB_NAME);
console.log("DB_USER :", process.env.DB_USER);
console.log("=====================================");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

pool
  .connect()
  .then((client) => {
    console.log("✅ Connected to PostgreSQL");

    client.release();
  })
  .catch((err) => {
    console.error("❌ PostgreSQL Connection Failed");
    console.error(err);
  });

const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        department VARCHAR(255),
        salary NUMERIC
      );
    `);

    console.log("✅ Employees table ready");
  } catch (err) {
    console.error("❌ Table creation failed");
    console.error(err);
  }
};

createTable();

module.exports = pool;