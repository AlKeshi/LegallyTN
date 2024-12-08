const express = require('express');
const {
  createConversation,
  getConversations,
  updateConversation,
  deleteConversation
} = require('../controllers/conversationController');
const { checkAuthenticated } = require('../middlewares/authentication');

const router = express.Router();

router.post('/', checkAuthenticated, createConversation);
router.get('/', checkAuthenticated, getConversations);
router.put('/:id', checkAuthenticated, updateConversation);
router.delete('/:id', checkAuthenticated, deleteConversation);

module.exports = router;
