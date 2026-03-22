const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.MYSQL_ADDON_HOST || 'bi2fabtjz2bwwwx1inxc-mysql.services.clever-cloud.com',
  user: process.env.MYSQL_ADDON_USER || 'umfixvvqkqoyalne',
  password: process.env.MYSQL_ADDON_PASSWORD || 'o4tkBzQSDKINwOJK3s1X',
  database: process.env.MYSQL_ADDON_DB || 'bi2fabtjz2bwwwx1inxc',
  port: process.env.MYSQL_ADDON_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = mysql.createPool(dbConfig);

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  dbConfig
};