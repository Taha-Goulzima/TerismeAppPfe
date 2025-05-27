import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useAuth();
  
  // State management
  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [newReview, setNewReview] = useState({
    note: 5,
    commentaire: ''
  });
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Fetch tour data and reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tour details - this should work for all users
        const tourResponse = await axios.get(`http://localhost:5000/voyages/${id}`);
        setTour(tourResponse.data);

        // Only fetch reviews and check inscription status if user is authenticated
        if (isAuthenticated()) {
          const token = getToken();
          if (token) {
            try {
              // Fetch reviews
              const reviewsResponse = await axios.get(`http://localhost:5000/avis/voyage/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              setReviews(reviewsResponse.data.avis);

              // Check if user can review
              const inscriptionResponse = await axios.get(`http://localhost:5000/inscription/user`, {
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (inscriptionResponse.data && inscriptionResponse.data.inscriptions) {
                const userInscription = inscriptionResponse.data.inscriptions.find(
                  ins => ins.voyage && ins.voyage._id === id && ins.statut === 'Accepté'
                );
                setCanReview(!!userInscription);
                
                // Check if user has already reviewed
                const hasUserReviewed = reviewsResponse.data.avis.some(
                  review => review.utilisateur && review.utilisateur._id === userInscription?.utilisateur?._id
                );
                setHasReviewed(hasUserReviewed);
              }
            } catch (err) {
              console.error('Error fetching reviews or checking inscription:', err);
              if (err.response?.status === 401) {
                navigate('/login');
              }
              setCanReview(false);
            }
          }
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tour details');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, getToken, navigate]);

  // Handle booking
  const handleBooking = async () => {
    if (bookingInProgress) return;

    if (!isAuthenticated()) {
      alert('You need an account to make a booking. Please login or create an account.');
      navigate('/login');
      return;
    }

    const token = getToken();
    if (!token) {
      alert('Your session has expired. Please login again.');
      navigate('/login');
      return;
    }

    try {
      setBookingInProgress(true);
      
      const response = await axios.post('http://localhost:5000/inscription', {
        voyageId: id,
        nombrePersonnes: guestCount
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        alert('Booking confirmed successfully!');
        navigate('/mytours');
      }
    } catch (err) {
      console.error('Booking error:', err);
      
      if (err.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        navigate('/login');
        return;
      }

      const errorMessage = err.response?.data?.message || 'Error making booking. Please try again.';
      alert(errorMessage);
    } finally {
      setBookingInProgress(false);
    }
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    try {
      if (!isAuthenticated()) {
        alert('Please login to submit a review');
        navigate('/login');
        return;
      }

      if (!canReview) {
        alert('You need to have an accepted booking to leave a review');
        return;
      }

      if (hasReviewed) {
        alert('You have already reviewed this tour');
        return;
      }

      const token = getToken();
      // Decode the token to get user ID
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.id;

      const response = await axios.post('http://localhost:5000/avis', {
        voyage: id,
        utilisateur: userId,
        note: newReview.note,
        commentaire: newReview.commentaire
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch updated reviews
      const updatedReviewsResponse = await axios.get(`http://localhost:5000/avis/voyage/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReviews(updatedReviewsResponse.data.avis);
      setNewReview({ note: 5, commentaire: '' });
      setHasReviewed(true);
      alert('Review submitted successfully!');
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error submitting review';
      alert(errorMessage);
      
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  // Helper functions
  const calculateAverageRating = () => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.note, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  // Helper function to get emoji for activity
  const getActivityEmoji = (activity) => {
    const emojiMap = {
      'Beach Fun': '🏖️',
      'Cultural & Heritage': '🏛️',
      'Adventure & Nature': '🏔️',
      'City Exploration': '🌆',
      'Food & Culinary': '🍽️',
      'Shopping': '🛍️',
      'Nightlife': '🌃',
      'Relaxation & Wellness': '🧘',
      'Sports & Recreation': '⚽',
      'Photography': '📸',
      'Local Experiences': '👥',
      'Wildlife & Safari': '🦁',
      'Water Sports': '🏄',
      'Hiking & Trekking': '🥾',
      'Museum & Art': '🎨',
      'Theme Parks': '🎢',
      'Cruise & Boat Tours': '🚢',
      'Festivals & Events': '🎉',
      'Religious Sites': '⛪',
      'Historical Tours': '🏰'
    };
    return emojiMap[activity] || '🎯'; // Default emoji if category not found
  };

  // Loading and error states
  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!tour) return <div className="text-center py-10">Tour not found</div>;

  const averageRating = calculateAverageRating();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Tour Information */}
        <div>
          <h1 className="text-3xl font-bold mb-6">{tour.titre}</h1>
          
          {/* Main Image */}
          <div className="mb-8">
            <img 
              src={tour.photo} 
              alt={tour.destination} 
              className="w-full h-[400px] object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Tour Info Icons */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">📍</span>
              <span>{tour.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">👥</span>
              <span>({tour.placesDisponible}) Places Available</span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400">{renderStars(averageRating)}</span>
              <span className="text-gray-600 ml-1">
                {averageRating} ({reviews.length} reviews)
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed">
              {tour.description}
            </p>
          </div>

          {/* Activities */}
          {tour.activities && tour.activities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Included Activities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tour.activities.map((activity, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 p-4 rounded-lg flex items-center gap-3"
                  >
                    <span className="text-blue-600 text-xl">{getActivityEmoji(activity)}</span>
                    <span className="text-gray-700 font-medium">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Travel Dates */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Travel Dates</h2>
            <div className="flex gap-8">
              <div>
                <p className="text-gray-600">Departure</p>
                <p className="font-semibold">
                  {new Date(tour.dateDeDepart).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Return</p>
                <p className="font-semibold">
                  {new Date(tour.dateDeRetour).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Customer Reviews</h2>
              {reviews.length > 0 && (
                <div className="flex items-center">
                  <span className="text-yellow-400 text-xl">{renderStars(averageRating)}</span>
                  <span className="text-gray-600 ml-2">
                    {averageRating} ({reviews.length} reviews)
                  </span>
                </div>
              )}
            </div>

            {!isAuthenticated() ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">Please login to view and submit reviews</p>
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-blue-600 hover:underline"
                >
                  Login here
                </button>
              </div>
            ) : (
              <>
                {/* Add Review Form */}
                {canReview && !hasReviewed && (
                  <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-4">Add Your Review</h3>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Rating</label>
                      <select
                        value={newReview.note}
                        onChange={(e) => setNewReview({...newReview, note: Number(e.target.value)})}
                        className="w-full p-2 border rounded-lg"
                      >
                        {[5, 4, 3, 2, 1].map(num => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Star' : 'Stars'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Comment</label>
                      <textarea
                        value={newReview.commentaire}
                        onChange={(e) => setNewReview({...newReview, commentaire: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                        rows="3"
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Submit Review
                    </button>
                  </form>
                )}

                {canReview && hasReviewed && (
                  <div className="mb-8 bg-green-50 p-4 rounded-lg">
                    <p className="text-green-700">You have already reviewed this tour.</p>
                  </div>
                )}

                {!canReview && (
                  <div className="mb-8 bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-700">You need to have an accepted booking to leave a review.</p>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold">
                          {review.utilisateur?.nom || 'Anonymous'}
                        </div>
                        <span className="text-yellow-400">{renderStars(review.note)}</span>
                      </div>
                      <p className="text-gray-600">{review.commentaire}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <p className="text-gray-500 text-center">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Booking Information */}
        <div>
          <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Booking</h2>
            
            {/* Price */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl">${tour.prix}/Per Person</span>
            </div>

            {/* Guest Count - Only show if user is authenticated */}
            {isAuthenticated() && (
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">No. Of Guest</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="bg-gray-200 px-3 py-1 rounded"
                    disabled={guestCount <= 1}
                  >
                    -
                  </button>
                  <span>{guestCount} adults</span>
                  <button 
                    onClick={() => setGuestCount(Math.min(tour.placesDisponible, guestCount + 1))}
                    className="bg-gray-200 px-3 py-1 rounded"
                    disabled={guestCount >= tour.placesDisponible}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="mb-6">
              <span className="font-semibold">Status: </span>
              <span className={`${tour.placesDisponible > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tour.placesDisponible > 0 ? 'Available' : 'Full'}
              </span>
            </div>

            {/* Subtotal - Only show if user is authenticated */}
            {isAuthenticated() && (
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-xl font-bold">{tour.prix * guestCount} DH</span>
                </div>
              </div>
            )}

            {/* Book Now Button or Login Prompt */}
            {isAuthenticated() ? (
              <button 
                onClick={handleBooking}
                disabled={tour.placesDisponible <= 0 || bookingInProgress}
                className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
                  tour.placesDisponible > 0 && !bookingInProgress 
                    ? 'bg-yellow-400 text-black hover:bg-yellow-500' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {bookingInProgress 
                  ? 'Processing...' 
                  : tour.placesDisponible > 0 
                    ? 'Confirm Booking' 
                    : 'Tour Full'}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Please login to make a booking</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
                >
                  Login to Book
                </button>
              </div>
            )}

            {/* Share */}
            <div className="mt-6 flex items-center gap-2">
              <span className="text-gray-600">Share:</span>
              <button className="text-blue-600 hover:opacity-80">
                <i className="fab fa-facebook-f"></i>
              </button>
              <button className="text-blue-400 hover:opacity-80">
                <i className="fab fa-twitter"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TourDetails;