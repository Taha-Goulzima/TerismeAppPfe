import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

function AssociationReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is an association
    if (user?.role !== 'association') {
      navigate('/');
      return;
    }
    fetchReviews();
  }, [user, navigate]);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/avis/association');
      setReviews(response.data.avis);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data.message || 'Failed to fetch reviews');
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Error setting up the request');
      }
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await api.delete(`/avis/${reviewId}`);
      // Refresh reviews after deletion
      fetchReviews();
      alert('Review deleted successfully');
    } catch (err) {
      console.error('Error deleting review:', err);
      if (err.response) {
        alert(err.response.data.message || 'Failed to delete review');
      } else if (err.request) {
        alert('No response from server. Please check your connection.');
      } else {
        alert('Error setting up the request');
      }
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Reviews</h1>
        
        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {review.voyage?.destination || 'Tour'}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-yellow-400">{renderStars(review.note)}</span>
                    <span>by {review.utilisateur?.nom || 'Anonymous'}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-700 mb-4">{review.commentaire}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    {review.voyage?.associationId?.nom || 'Association'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded ${
                    review.note >= 4 ? 'bg-green-100 text-green-700' :
                    review.note >= 3 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {review.note} {review.note === 1 ? 'Star' : 'Stars'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {reviews.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No reviews found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssociationReviews; 