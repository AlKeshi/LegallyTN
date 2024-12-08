const db = require('../config/db');

const Conversation = {
  // Create a new conversation
  async create(userId, title) {
    const result = await db.query(
      `INSERT INTO conversations (user_id, title, created_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, title, new Date()]
    );
    return result.rows[0];
  },


  async findAllByUser(userId) {
    const result = await db.query(
      `SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Find a conversation by ID
  async findById(conversationId, userId) {
    const result = await db.query(
      `SELECT * FROM conversations WHERE id = $1 AND user_id = $2`,
      [conversationId, userId]
    );
    return result.rows[0];
  },

  // Update a conversation
  async update(conversationId, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    let query = `UPDATE conversations SET `;
    keys.forEach((key, index) => {
      query += `${key} = $${index + 1}`;
      if (index < keys.length - 1) query += ', ';
    });

    query += ` WHERE id = $${keys.length + 1} RETURNING *`;
    values.push(conversationId);

    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete a conversation
  async delete(conversationId, userId) {
    const result = await db.query(
      `DELETE FROM conversations WHERE id = $1 AND user_id = $2 RETURNING *`,
      [conversationId, userId]
    );
    return result.rows[0];
  }
};

module.exports = Conversation;
