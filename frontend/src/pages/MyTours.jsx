import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MyTours() {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, getToken, logout } = useAuth();

  useEffect(() => {
    const fetchMyInscriptions = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          navigate('/login');
          return;
        }

        // Get token and verify it exists
        const token = getToken();
        if (!token) {
          navigate('/login');
          return;
        }

        // Make API request with token
        const response = await axios.get('http://localhost:5000/inscription/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.inscriptions) {
          setInscriptions(response.data.inscriptions);
        } else {
          setInscriptions([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching inscriptions:', err);
        
        // Handle different error cases
        if (err.response?.status === 401) {
          // Token is invalid or expired
          logout(); // Clear invalid session
          navigate('/login');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view these tours');
        } else {
          setError('Failed to fetch your tours. Please try again later.');
        }
        setLoading(false);
      }
    };

    fetchMyInscriptions();
  }, [navigate, isAuthenticated, getToken, logout]);

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'Accepté':
        return 'text-green-600 bg-green-100';
      case 'Refusé':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-500 text-center">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Tours</h1>

        {inscriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600 mb-4">You haven't booked any tours yet.</p>
            <button
              onClick={() => navigate('/tours')}
              className="bg-orange-400 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition-colors duration-300"
            >
              Browse Tours
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inscriptions.map((inscription) => (
              <div key={inscription._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {inscription.voyage && (
                  <>
                    <img 
                      src={inscription.voyage.photo} 
                      alt={inscription.voyage.destination} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = 'https://via.placeholder.com/400x200?text=Tour+Image';
                      }}
                    />
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                          {inscription.voyage.destination}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inscription.statut)}`}>
                          {inscription.statut}
                        </span>
                      </div>

                      <div className="space-y-2 text-gray-600">
                        <p className="flex items-center">
                          <span className="material-icons mr-2 text-orange-400">group</span>
                          {inscription.nombrePersonnes} {inscription.nombrePersonnes === 1 ? 'Person' : 'People'}
                        </p>
                        
                        <p className="flex items-center">
                          <span className="material-icons mr-2 text-orange-400">payments</span>
                          Total: ${inscription.totalPrix}
                        </p>

                        {inscription.voyage.dateDeDepart && (
                          <p className="flex items-center">
                            <span className="material-icons mr-2 text-orange-400">event</span>
                            {formatDate(inscription.voyage.dateDeDepart)}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => navigate(`/tour/${inscription.voyage._id}`)}
                          className="w-full bg-orange-400 text-white py-2 rounded-lg hover:bg-orange-500 transition-colors duration-300"
                        >
                          View Tour Details
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTours;