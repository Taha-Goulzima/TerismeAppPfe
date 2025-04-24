const Message = ({ message, onDelete, currentUser }) => {
  return (
    <div className="message-container">
      <div className="message-header">
        <span className="message-sender">{message.senderName}</span>
        <span className="message-date">{formatDate(message.createdAt)}</span>
        {currentUser?.role === 'admin' && (
          <button 
            className="delete-button"
            onClick={() => onDelete(message._id)}
          >
            Delete
          </button>
        )}
      </div>
      <div className="message-content">{message.content}</div>
      {message.replies && message.replies.length > 0 && (
        <div className="replies-container">
          {message.replies.map(reply => (
            <div key={reply._id} className="reply">
              <div className="reply-header">
                <span className="reply-sender">{reply.senderName}</span>
                <span className="reply-date">{formatDate(reply.createdAt)}</span>
                {currentUser?.role === 'admin' && (
                  <button 
                    className="delete-button"
                    onClick={() => onDelete(reply._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="reply-content">{reply.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 