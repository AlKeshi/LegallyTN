const express = require('express');
const { createMessage, getMessagesByConversation } = require('../controllers/messageController');
const { checkAuthenticated } = require('../middlewares/authentication');

const router = express.Router();

router.post('/', checkAuthenticated, createMessage);
router.get('/:conversationId', checkAuthenticated, getMessagesByConversation);

module.exports = router;
