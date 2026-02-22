// Setup Database Schema for Baby Activity Monitor
// This script creates all necessary database tables

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   Baby Activity Monitor - Database Setup                  ║');
  console.log('║   Creating tables in Clever Cloud MySQL                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let connection;

  try {
    // Create connection
    console.log('========================================');
    console.log('1. Connecting to database...');
    console.log('========================================');
    
    connection = await mysql.createConnection({
      host: process.env.MYSQL_ADDON_HOST || 'bi2fabtjz2bwwwx1inxc-mysql.services.clever-cloud.com',
      user: process.env.MYSQL_ADDON_USER || 'umfixvvqkqoyalne',
      password: process.env.MYSQL_ADDON_PASSWORD || 'o4tkBzQSDKINwOJK3s1X',
      database: process.env.MYSQL_ADDON_DB || 'bi2fabtjz2bwwwx1inxc',
      port: process.env.MYSQL_ADDON_PORT || 3306,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✓ Connected successfully!');
    console.log(`  Host: ${process.env.MYSQL_ADDON_HOST}`);
    console.log(`  Database: ${process.env.MYSQL_ADDON_DB}\n`);

    // Read schema file
    console.log('========================================');
    console.log('2. Reading schema.sql file...');
    console.log('========================================');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✓ Schema file loaded successfully\n');

    // Split schema into individual statements and clean them
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        // Remove empty statements and comment-only lines
        if (!stmt || stmt.length === 0) return false;
        // Remove lines that are just comments
        const lines = stmt.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed && !trimmed.startsWith('--');
        });
        return lines.length > 0;
      });

    console.log('========================================');
    console.log('3. Creating database tables...');
    console.log('========================================');

    let createdCount = 0;
    for (const statement of statements) {
      // Clean up the statement - remove comment lines
      const cleanStatement = statement
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim();

      if (!cleanStatement) continue;

      if (cleanStatement.toUpperCase().includes('CREATE TABLE')) {
        // Extract table name
        const match = cleanStatement.match(/CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/i);
        const tableName = match ? match[1] : 'unknown';
        
        try {
          await connection.execute(cleanStatement);
          console.log(`✓ Created table: ${tableName}`);
          createdCount++;
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`  Table already exists: ${tableName}`);
          } else {
            console.log(`✗ Error creating table ${tableName}:`, error.message);
            console.log(`   Statement: ${cleanStatement.substring(0, 100)}...`);
          }
        }
      } else if (cleanStatement.toUpperCase().includes('CREATE INDEX')) {
        // Create index
        const match = cleanStatement.match(/CREATE (?:UNIQUE )?INDEX (?:IF NOT EXISTS )?`?(\w+)`?/i);
        const indexName = match ? match[1] : 'unknown';
        
        try {
          await connection.execute(cleanStatement);
          console.log(`✓ Created index: ${indexName}`);
        } catch (error) {
          if (error.code === 'ER_DUP_KEYNAME') {
            console.log(`  Index already exists: ${indexName}`);
          } else {
            console.log(`  Note: ${indexName} - ${error.message}`);
          }
        }
      }
    }

    console.log('\n========================================');
    console.log('4. Verifying database setup...');
    console.log('========================================');

    // Verify tables exist
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✓ Database contains ${tables.length} tables:`);
    tables.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log(`  - ${tableName}`);
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   ✓ Database Setup Complete!                              ║');
    console.log('║   You can now run: node database-demo.js                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n✗ Database setup failed:');
    console.error('  Error:', error.message);
    console.error('  Code:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n  → Check your database host in .env file');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n  → Check your database credentials in .env file');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup
setupDatabase();
