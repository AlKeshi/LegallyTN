const db = require('../config/db'); // Import your database configuration

const User = {
  // Find a user by email
  async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  // Find a user by ID
  async findById(id) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Create a new user
  async create(userData) {
    const { firstName, lastName, email, hashedPassword, phoneNumber, userType, barNumber } = userData;
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, password, phone_number, user_type, bar_number, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, first_name, last_name, email, user_type`,
      [firstName, lastName, email, hashedPassword, phoneNumber, userType, barNumber, new Date()]
    );
    return result.rows[0];
  },

  // Check if a user exists by email
  async exists(email) {
    const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    return result.rows.length > 0;
  }
};

module.exports = User;
