const mongoose = require('mongoose');
const Message = require('./models/Message');
require('dotenv').config();

const testMessage = async () => {
  try {
    await mongoose.connect(process.env.dbURL);
    console.log('Connected to MongoDB');

    const messages = await Message.find();
    console.log('Messages:', messages);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
};

testMessage(); 