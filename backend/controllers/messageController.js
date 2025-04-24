const Message = require('../model/Message');
const User = require('../model/User');

// Get all messages with pagination
exports.getMessages = async (req, res) => {
  try {
    console.log('Fetching messages with pagination');
    console.log('User:', req.user); // Log the user object
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    console.log(`Page: ${page}, Limit: ${limit}, Skip: ${skip}`);

    const messages = await Message.find({ parentMessage: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'nom profilePicture')
      .populate({
        path: 'likes',
        select: 'nom profilePicture'
      });
    
    console.log(`Found ${messages.length} messages`);
    console.log('Messages:', JSON.stringify(messages, null, 2));

    const total = await Message.countDocuments({ parentMessage: null });
    console.log(`Total messages: ${total}`);

    res.json({
      messages,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total
    });
  } catch (error) {
    console.error('Error in getMessages:', error);
    console.error('Error stack:', error.stack);
    console.error('Request user:', req.user);
    console.error('Request query:', req.query);
    
    res.status(500).json({ 
      message: 'Error fetching messages', 
      error: error.message,
      stack: error.stack,
      details: {
        user: req.user,
        query: req.query
      }
    });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { content, parentMessageId } = req.body;
    const userId = req.user.id;

    const newMessage = new Message({
      content,
      sender: userId,
      parentMessage: parentMessageId || null
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'nom profilePicture')
      .populate({
        path: 'likes',
        select: 'nom profilePicture'
      });

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error creating message', error: error.message });
  }
};

// Get replies for a specific message
exports.getReplies = async (req, res) => {
  try {
    const { messageId } = req.params;
    const replies = await Message.find({ parentMessage: messageId })
      .sort({ createdAt: 1 })
      .populate('sender', 'nom profilePicture')
      .populate({
        path: 'likes',
        select: 'nom profilePicture'
      });

    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching replies', error: error.message });
  }
};

// Like/Unlike a message
exports.toggleLike = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const likeIndex = message.likes.indexOf(userId);
    if (likeIndex === -1) {
      message.likes.push(userId);
    } else {
      message.likes.splice(likeIndex, 1);
    }

    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate('sender', 'nom profilePicture')
      .populate({
        path: 'likes',
        select: 'nom profilePicture'
      });

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can delete messages' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Delete the message and all its replies
    await Message.deleteMany({
      $or: [
        { _id: messageId },
        { parentMessage: messageId }
      ]
    });

    res.json({ message: 'Message and replies deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
}; 