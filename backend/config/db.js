const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,

    ssl: {
        require: true,
        rejectUnauthorized: false
    }
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

    console.log("Employees table ready");
  } catch (err) {
    console.error("Table creation failed:", err);
  }
};

createTable();

module.exports = pool;