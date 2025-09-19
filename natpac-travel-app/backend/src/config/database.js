const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'natpac_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'natpac_travel_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // how long to wait when connecting a new client
};

// Create connection pool
const pool = new Pool(dbConfig);

// Pool error handling
pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    logger.info('Database connection successful:', result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    throw error;
  }
};

// Run database schema setup
const setupDatabase = async () => {
  try {
    await testConnection();
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, '../../docs/database-schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        for (const statement of statements) {
          if (statement.toLowerCase().includes('create') || 
              statement.toLowerCase().includes('insert') ||
              statement.toLowerCase().includes('alter')) {
            try {
              await client.query(statement);
              logger.info(`Executed: ${statement.substring(0, 50)}...`);
            } catch (error) {
              if (error.message.includes('already exists')) {
                logger.info(`Skipped existing: ${statement.substring(0, 50)}...`);
              } else {
                throw error;
              }
            }
          }
        }
        
        await client.query('COMMIT');
        logger.info('Database schema setup completed successfully');
      } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Database schema setup failed:', error);
        throw error;
      } finally {
        client.release();
      }
    } else {
      logger.warn('Database schema file not found, skipping schema setup');
    }
    
  } catch (error) {
    logger.error('Database setup error:', error);
    throw error;
  }
};

// Query helper function
const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (process.env.NODE_ENV !== 'production') {
    logger.debug('Executed query:', { 
      text: text.substring(0, 100), 
      duration: `${duration}ms`, 
      rows: result.rowCount 
    });
  }
  
  return result;
};

// Transaction helper
const withTransaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get database statistics
const getDatabaseStats = async () => {
  try {
    const statsQuery = `
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables 
      ORDER BY tablename;
    `;
    
    const result = await query(statsQuery);
    return result.rows;
  } catch (error) {
    logger.error('Error getting database stats:', error);
    return [];
  }
};

// Close database connections
const closeDatabase = async () => {
  try {
    await pool.end();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
};

module.exports = {
  pool,
  query,
  withTransaction,
  setupDatabase,
  testConnection,
  getDatabaseStats,
  closeDatabase
};