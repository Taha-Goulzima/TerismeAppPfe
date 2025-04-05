import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AssociationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [association, setAssociation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssociationDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view association details');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const response = await axios.get(`http://localhost:5000/association/${id}`, config);
        setAssociation(response.data.association);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        if (err.response?.status === 401) {
          setError('You need admin privileges to view this content');
        } else if (err.response?.status === 404) {
          setError('Association not found');
        } else {
          setError('Failed to fetch association details');
        }
        setLoading(false);
      }
    };

    fetchAssociationDetails();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-red-500 text-center mb-4">{error}</div>
      <div className="flex gap-4">
        <button 
          onClick={() => navigate('/login')}
          className="bg-orange-400 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition-colors duration-300"
        >
          Go to Login
        </button>
        <button 
          onClick={() => navigate('/association')}
          className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-300"
        >
          Back to Associations
        </button>
      </div>
    </div>
  );

  if (!association) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-gray-600">Association not found</div>
      <button 
        onClick={() => navigate('/association')}
        className="mt-4 bg-orange-400 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition-colors duration-300"
      >
        Back to Associations
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-64">
          <img 
            src={association.photo} 
            alt={association.nom} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <h1 className="absolute bottom-6 left-6 text-4xl font-bold text-white">
            {association.nom}
          </h1>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <span className="material-icons mr-3">email</span>
                <p>{association.email}</p>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="material-icons mr-3">phone</span>
                <p>{association.phone}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {association.description}
            </p>
          </div>

          {association.voyages && association.voyages.length > 0 && (
            <div className="border-t border-gray-200 mt-8 pt-6">
              <h2 className="text-2xl font-semibold mb-6">Associated Tours</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {association.voyages.map((voyage) => (
                  <div key={voyage._id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                    onClick={() => navigate(`/tour/${voyage._id}`)}
                  >
                    <div className="relative h-48">
                      <img 
                        src={voyage.photo} 
                        alt={voyage.destination}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
                          e.target.onerror = null;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1">{voyage.destination}</h3>
                        <div className="flex items-center text-white/90 text-sm">
                          <span className="material-icons mr-1 text-base">calendar_today</span>
                          <span>{new Date(voyage.dateDeDepart).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-gray-600">
                          <span className="material-icons mr-1 text-base">attach_money</span>
                          <span className="font-semibold">${voyage.prix}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="material-icons mr-1 text-base">flight_return</span>
                          <span className="text-sm">{new Date(voyage.dateDeRetour).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="material-icons mr-1 text-base">group</span>
                        <span className="text-sm">{voyage.placesDisponible} places available</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssociationDetails;