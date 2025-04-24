import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { formatDistanceToNow } from 'date-fns';
import { FaHeart, FaRegHeart, FaReply, FaTrash, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Community = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await api.get(`/messages?page=${page}&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Fetch replies for each message
        const messagesWithReplies = await Promise.all(
          response.data.messages.map(async (message) => {
            try {
              const repliesResponse = await api.get(`/messages/${message._id}/replies`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              return {
                ...message,
                replies: repliesResponse.data
              };
            } catch (error) {
              console.error(`Error fetching replies for message ${message._id}:`, error);
              return {
                ...message,
                replies: []
              };
            }
          })
        );

        setMessages(prev => page === 1 ? messagesWithReplies : [...prev, ...messagesWithReplies]);
        setHasMore(response.data.currentPage < response.data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error.response?.data || error.message);
        setLoading(false);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    };

    loadInitialMessages();
  }, [page]); // Only re-fetch when page changes

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = replyingTo ? replyContent : newMessage;
    if (!content.trim()) return;

    try {
      const response = await api.post('/messages', {
        content: content,
        parentMessageId: replyingTo?._id
      });

      if (replyingTo) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === replyingTo._id
              ? { ...msg, replies: [...(msg.replies || []), response.data] }
              : msg
          )
        );
        setReplyingTo(null);
        setReplyContent('');
      } else {
        try {
          const repliesResponse = await api.get(`/messages/${response.data._id}/replies`);
          const newMessageWithReplies = {
            ...response.data,
            replies: repliesResponse.data
          };
          setMessages(prevMessages => [newMessageWithReplies, ...prevMessages]);
        } catch (error) {
          console.error('Error fetching replies for new message:', error);
          setMessages(prevMessages => [response.data, ...prevMessages]);
        }
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error posting message:', error);
    }
  };

  const handleLike = async (messageId) => {
    try {
      const response = await api.post(`/messages/${messageId}/like`);
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId ? response.data : msg
        )
      );
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg._id !== messageId)
      );
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const MessageCard = ({ message, isReply = false }) => {
    const isLiked = message.likes.some(like => like._id === user?._id);
    const isAuthor = message.sender._id === user?._id;

    const formatDate = (date) => {
      try {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
      } catch (error) {
        return new Date(date).toLocaleDateString();
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 mb-4 ${
          isReply ? 'ml-8 border-l-4 border-blue-200' : ''
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={message.sender.profilePicture ? `http://localhost:5000${message.sender.profilePicture}` : '/default-avatar.png'}
              alt={message.sender.nom}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
            {!isReply && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{message.sender.nom}</h3>
                <p className="text-gray-500 text-sm">
                  {formatDate(message.createdAt)}
                </p>
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleDelete(message._id)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <FaTrash />
                </button>
              )}
            </div>
            <p className="mt-2 text-gray-700">{message.content}</p>
            <div className="flex items-center space-x-4 mt-3">
              <button
                onClick={() => handleLike(message._id)}
                className={`flex items-center space-x-1 transition-colors duration-200 ${
                  isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
                <span className="text-sm">{message.likes.length}</span>
              </button>
              {!isReply && (
                <button
                  onClick={() => {
                    setReplyingTo(message);
                    setReplyContent('');
                  }}
                  className="flex items-center space-x-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  <FaReply />
                  <span className="text-sm">Reply</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Community Chat</h1>
          
          {/* New Message Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your thoughts with the community..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                rows="3"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  <span>Post</span>
                  <FaPaperPlane className="text-sm" />
                </button>
              </div>
            </div>
          </form>

          {/* Reply Form */}
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 bg-blue-50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-blue-800">
                    Replying to {replyingTo.sender.nom}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                  >
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                    rows="2"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      <span>Reply</span>
                      <FaPaperPlane className="text-sm" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {messages.map(message => (
                  <div key={message._id}>
                    <MessageCard message={message} />
                    {message.replies?.map(reply => (
                      <MessageCard key={reply._id} message={reply} isReply />
                    ))}
                  </div>
                ))}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    className="w-full py-3 text-blue-500 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Load More Messages
                  </button>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community; 