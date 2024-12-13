const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'higgs',
  port: process.env.DB_PORT || 5432, // Default PostgreSQL port
});

// Export a wrapper for the query method for better error management
module.exports = {
  query: async (text, params) => {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('Database query error:', err);
      throw err;
    }
  },
};
