/**
 * Database Connection Demonstration
 * Baby Activity Monitoring Application - Milestone 2
 * 
 * This script demonstrates:
 * 1. Connection to cloud database (Clever Cloud MySQL)
 * 2. Data retrieval
 * 3. Data manipulation (insert, update)
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration for Clever Cloud MySQL
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

// Create connection pool
const pool = mysql.createPool(dbConfig);

async function demonstrateDatabaseOperations() {
  let connection;
  
  try {
    // 1. TEST CONNECTION
    console.log('========================================');
    console.log('1. Testing Database Connection...');
    console.log('========================================');
    connection = await pool.getConnection();
    console.log('✓ Successfully connected to Clever Cloud MySQL database');
    console.log(`  Host: ${dbConfig.host}`);
    console.log(`  Database: ${dbConfig.database}`);
    console.log('');

    // 2. RETRIEVE DATA - Show existing users
    console.log('========================================');
    console.log('2. Retrieving Data from Database...');
    console.log('========================================');
    const [users] = await connection.query('SELECT id, email, first_name, last_name, created_at FROM users LIMIT 5');
    console.log(`✓ Retrieved ${users.length} users from database:`);
    users.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.email})`);
    });
    console.log('');

    // 3. INSERT DATA - Create a test user
    console.log('========================================');
    console.log('3. Inserting Data into Database...');
    console.log('========================================');
    const testEmail = `test_${Date.now()}@demo.com`;
    const [insertResult] = await connection.query(
      'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
      [testEmail, '$2a$10$hashedPasswordExample', 'Test', 'User']
    );
    console.log(`✓ Successfully inserted new user:`);
    console.log(`  - User ID: ${insertResult.insertId}`);
    console.log(`  - Email: ${testEmail}`);
    console.log('');

    // 4. UPDATE DATA - Update the test user
    console.log('========================================');
    console.log('4. Updating Data in Database...');
    console.log('========================================');
    const [updateResult] = await connection.query(
      'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
      ['Updated', 'TestUser', insertResult.insertId]
    );
    console.log(`✓ Successfully updated user record:`);
    console.log(`  - Rows affected: ${updateResult.affectedRows}`);
    console.log('');

    // 5. VERIFY UPDATE - Retrieve updated user
    console.log('========================================');
    console.log('5. Verifying Update...');
    console.log('========================================');
    const [updatedUser] = await connection.query(
      'SELECT id, email, first_name, last_name FROM users WHERE id = ?',
      [insertResult.insertId]
    );
    if (updatedUser.length > 0) {
      console.log(`✓ Verified updated user:`);
      console.log(`  - Name: ${updatedUser[0].first_name} ${updatedUser[0].last_name}`);
      console.log(`  - Email: ${updatedUser[0].email}`);
    }
    console.log('');

    // 6. RETRIEVE RELATED DATA - Show babies for users
    console.log('========================================');
    console.log('6. Retrieving Related Data (JOIN)...');
    console.log('========================================');
    const [babies] = await connection.query(`
      SELECT b.id, b.name, b.date_of_birth, b.gender, 
             u.first_name as parent_first_name, u.last_name as parent_last_name
      FROM babies b
      JOIN users u ON b.user_id = u.id
      LIMIT 5
    `);
    console.log(`✓ Retrieved ${babies.length} baby records with parent information:`);
    babies.forEach(baby => {
      console.log(`  - ${baby.name} (${baby.gender}) - Parent: ${baby.parent_first_name} ${baby.parent_last_name}`);
    });
    console.log('');

    // 7. CLEANUP - Delete test user
    console.log('========================================');
    console.log('7. Cleaning Up Test Data...');
    console.log('========================================');
    await connection.query('DELETE FROM users WHERE id = ?', [insertResult.insertId]);
    console.log(`✓ Successfully deleted test user (ID: ${insertResult.insertId})`);
    console.log('');

    console.log('========================================');
    console.log('✓ All database operations completed successfully!');
    console.log('========================================');

  } catch (error) {
    console.error('✗ Database operation failed:');
    console.error(`  Error: ${error.message}`);
    console.error(`  Code: ${error.code}`);
    if (error.sql) {
      console.error(`  SQL: ${error.sql}`);
    }
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConnection released back to pool.');
    }
    await pool.end();
    console.log('Connection pool closed.');
  }
}

// Run the demonstration
console.log('\n');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   Baby Activity Monitor - Database Demo (Milestone 2)     ║');
console.log('║   Cloud Database: Clever Cloud MySQL                       ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('\n');

demonstrateDatabaseOperations();
