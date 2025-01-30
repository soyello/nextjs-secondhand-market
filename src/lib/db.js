import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  queueLimit: 0,
  connectionLimit: 10,
  waitForConnections: true,
});

export default pool;
