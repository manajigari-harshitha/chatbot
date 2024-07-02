// db.js

// Import necessary modules
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create the MySQL connection pool
const pool = mysql.createPool({
  host: process.env.SQLHOST || 'localhost',
  user: process.env.SQLUSER || 'root',
  password: process.env.SQLPASSWORD || '',
  database: process.env.SQLDATABASE || 'chatuser',
  port: process.env.SQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to execute queries
async function executeQuery(sql, values = []) {
  const connection = await pool.getConnection();
  try {
    const [rows, fields] = await connection.execute(sql, values);
    return rows;
  } finally {
    connection.release();
  }
}

// Export the executeQuery function and the pool for use in other modules
module.exports = {
  executeQuery,
  pool
};
