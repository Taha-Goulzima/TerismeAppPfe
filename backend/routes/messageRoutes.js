const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected and require authentication
router.use(protect);

// Get all messages with pagination
router.get('/', messageController.getMessages);

// Create a new message
router.post('/', messageController.createMessage);

// Get replies for a specific message
router.get('/:messageId/replies', messageController.getReplies);

// Like/Unlike a message
router.post('/:messageId/like', messageController.toggleLike);

// Delete a message
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router; 