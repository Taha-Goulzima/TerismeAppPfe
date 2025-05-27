import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Tours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        // First get all associations
        const associationsResponse = await axios.get('http://localhost:5000/association');
        console.log('Associations response:', associationsResponse.data);

        // Extract all voyages from all associations
        const allVoyages = associationsResponse.data.associations.reduce((acc, association) => {
          if (association.voyages && association.voyages.length > 0) {
            return [...acc, ...association.voyages.map(voyage => ({
              ...voyage,
              association: association.nom // Add association name to each voyage
            }))];
          }
          return acc;
        }, []);

        // Fetch reviews for each voyage
        const voyagesWithReviews = await Promise.all(
          allVoyages.map(async (voyage) => {
            try {
              const reviewsResponse = await axios.get(`http://localhost:5000/avis/voyage/${voyage._id}`);
              const reviews = reviewsResponse.data.avis;
              const averageRating = reviews.length > 0
                ? (reviews.reduce((acc, review) => acc + review.note, 0) / reviews.length).toFixed(1)
                : 0;
              return {
                ...voyage,
                averageRating: parseFloat(averageRating),
                reviewCount: reviews.length
              };
            } catch (err) {
              console.error(`Error fetching reviews for voyage ${voyage._id}:`, err);
              return {
                ...voyage,
                averageRating: 0,
                reviewCount: 0
              };
            }
          })
        );

        console.log('All voyages with reviews:', voyagesWithReviews);
        setTours(voyagesWithReviews);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tours:', err);
        setError('Failed to fetch tours');
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  // Generate stars based on rating
  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  // Calculate duration from duree field
  const getDuration = (duree) => {
    return duree || 'N/A';
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  // Filter tours based on search query
  const filteredTours = tours.filter(tour =>
    tour.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">
        All Tours
      </h1>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto mb-12 px-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-100 group-hover:border-blue-200 transition duration-300">
            <div className="pl-6 pr-2">
              <svg
                className="w-6 h-6 text-blue-500 group-hover:text-blue-600 transition duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tours by destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-4 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="pr-6 pl-2 text-gray-400 hover:text-gray-600 transition duration-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* Search Results Count */}
        <div className="text-center mt-4 text-gray-500">
          {filteredTours.length === 0 ? (
            <p className="text-red-500">No tours found matching your search</p>
          ) : (
            <p>Found {filteredTours.length} {filteredTours.length === 1 ? 'tour' : 'tours'}</p>
          )}
        </div>
      </div>

      {/* Tours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTours.map((tour) => (
          <div key={tour._id} className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            {/* Tour Image with Overlay */}
            <div className="relative h-64 overflow-hidden">
              <img 
                src={tour.photo || 'https://via.placeholder.com/400x300'} 
                alt={tour.destination} 
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Places Available Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-800 shadow-lg">
                <span className="text-blue-600">👥</span>
                <span>{tour.placesDisponible}</span>
                <span className="text-gray-500">places left</span>
              </div>
            </div>

            {/* Tour Info */}
            <div className="p-6">
              {/* Availability Status */}
              <div className="mb-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  tour.placesDisponible > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    tour.placesDisponible > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  {tour.placesDisponible > 0 ? 'Available' : 'Tour Full'}
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="bg-blue-100 p-1 rounded-full">📅</span>
                  <span>{new Date(tour.dateDeDepart).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="bg-green-100 p-1 rounded-full">🏁</span>
                  <span>{new Date(tour.dateDeRetour).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}</span>
                </div>
              </div>

              {/* Title and Location */}
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {tour.destination}
                </h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="bg-orange-100 p-1 rounded-full">📍</span>
                  <span>{tour.destination}</span>
                </div>
              </div>

              {/* Activities */}
              {tour.activities && tour.activities.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {tour.activities.map((activity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Association and Rating */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-100 p-1 rounded-full">🏢</span>
                  <span className="text-sm text-gray-600 font-medium">
                    {tour.association || 'Travel Association'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-lg">{renderStars(tour.averageRating)}</span>
                  <span className="text-sm text-gray-500">
                    ({tour.reviewCount} {tour.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              {/* Price and Button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">{tour.prix}</span>
                  <span className="text-gray-500">DH</span>
                </div>
                <button
                  onClick={() => navigate(`/tour/${tour._id}`)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                    tour.placesDisponible > 0
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={tour.placesDisponible <= 0}
                >
                  {tour.placesDisponible > 0 ? (
                    <span className="flex items-center gap-2">
                      Explore Now
                      <span className="text-lg">→</span>
                    </span>
                  ) : (
                    'Tour Full'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tours;