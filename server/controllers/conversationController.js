const Conversation = require('../models/conversationModel');

async function createConversation(req, res) {
  const { title } = req.body;
  const userId = req.user.id;

  try {
    const newConversation = await Conversation.create(userId, title);
    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
