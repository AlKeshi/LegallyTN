const db = require('../config/db');

const Message = {
  // Add a message to a conversation
  async create(conversationId, senderId, messageType, messageContent) {
    const result = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, message_type, message_content, sent_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [conversationId, senderId, messageType || 'text', messageContent, new Date()]
    );
    return result.rows[0];
  },

  // Fetch all messages for a conversation
  async findAllByConversation(conversationId) {
    const result = await db.query(
      `SELECT m.*, u.first_name, u.last_name, u.user_type
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1
       ORDER BY m.sent_at ASC`,
      [conversationId]
    );
    return result.rows;
  },

  // Delete a message
  async delete(messageId, senderId) {
    const result = await db.query(
      `DELETE FROM messages WHERE id = $1 AND sender_id = $2 RETURNING *`,
      [messageId, senderId]
    );
    return result.rows[0];
  }
};

module.exports = Message;
