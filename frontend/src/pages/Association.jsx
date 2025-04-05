import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Association() {
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/association');
        setAssociations(response.data.associations);
        setLoading(false);
      } catch (err) {
        // More specific error handling
        if (err.response?.status === 401) {
          setError('Please log in to view associations');
        } else {
          setError('Failed to fetch associations');
        }
        setLoading(false);
      }
    };

    fetchAssociations();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-red-500 text-center mb-4">{error}</div>
      {error.includes('log in') && (
        <button 
          onClick={() => navigate('/login')}
          className="bg-orange-400 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition-colors duration-300"
        >
          Go to Login
        </button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-orange-500 mb-8">Associations</h1>
      
      {associations.length === 0 ? (
        <div className="text-center text-gray-600">No associations found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {associations.map((association) => (
            <div key={association._id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <img 
                src={association.photo} 
                alt={association.nom} 
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; // Fallback image
                }}
              />
              
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">{association.nom}</h2>
                
                <div className="space-y-2 mb-4">
                  <p className="flex items-center text-gray-600">
                    <span className="material-icons mr-2">email</span>
                    {association.email}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <span className="material-icons mr-2">phone</span>
                    {association.phone}
                  </p>
                </div>
                
                <button
                  onClick={() => navigate(`/association/${association._id}`)}
                  className="w-full bg-orange-400 text-white py-2 rounded-lg hover:bg-orange-500 transition-colors duration-300"
                >
                  more details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Association;