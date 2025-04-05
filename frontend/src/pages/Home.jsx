import React, { useState, useEffect } from 'react';

// Import images (you'll need to add these to your assets folder)

import { assets } from '../assets/assets'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [voyages, setVoyages] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVoyages = async () => {
      try {
        // Get all associations to get their voyages
        const response = await axios.get('http://localhost:5000/association');
        
        // Extract all voyages from all associations
        const allVoyages = response.data.associations.reduce((acc, association) => {
          if (association.voyages && association.voyages.length > 0) {
            return [...acc, ...association.voyages.map(voyage => ({
              ...voyage,
              association: association.nom // Add association name to each voyage
            }))];
          }
          return acc;
        }, []);

        setVoyages(allVoyages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching voyages:', err);
        setError('Failed to fetch voyages');
        setLoading(false);
      }
    };

    fetchVoyages();

    const fetchAssociations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/association');
        setAssociations(response.data.associations.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch associations:', err);
      }
    };

    fetchAssociations();
  }, []);
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      {/* Part 1: Hero Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center">
            <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
              <div className="max-w-lg">
                <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                  We Find The Best Tours For You
                </h1>
                <p className="text-gray-600 text-lg mb-8">
                  Embark on unforgettable journeys with our carefully curated tours. 
                  From breathtaking landscapes to cultural experiences, we connect you 
                  with the world's most amazing destinations. Let us transform your 
                  travel dreams into reality with personalized itineraries and 
                  exceptional service.
                </p>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <img src={assets.heroImg02} alt="Hero" className="rounded-lg shadow-xl w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Part 2: Services Section */}
      <section className="py-20 bg-orange-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-white/90 text-sm uppercase tracking-wider mb-2 block">Our Services</span>
            <h2 className="text-4xl font-bold text-white">
              We Offer Best Services
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Service Card 1 */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 hover:bg-gray-900/60 duration-300 border border-white/10">
              <div className="flex flex-col items-center text-center">
                <img 
                  src={assets.weatherImg} 
                  alt="Service" 
                  className="w-16 h-16 mb-6 hover:scale-110 duration-300" 
                />
                <h4 className="text-xl font-semibold mb-3 text-white">
                  Customized Tours
                </h4>
                <p className="text-gray-300">
                  Personalized itineraries tailored to your preferences
                </p>
              </div>
            </div>

            {/* Service Card 2 */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 hover:bg-gray-900/60 duration-300 border border-white/10">
              <div className="flex flex-col items-center text-center">
                <img 
                  src={assets.costomizationImg} 
                  alt="Service" 
                  className="w-16 h-16 mb-6 hover:scale-110 duration-300" 
                />
                <h4 className="text-xl font-semibold mb-3 text-white">
                  Expert Guides
                </h4>
                <p className="text-gray-300">
                  Professional and knowledgeable local guides
                </p>
              </div>
            </div>

            {/* Service Card 3 */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 hover:bg-gray-900/60 duration-300 border border-white/10">
              <div className="flex flex-col items-center text-center">
                <img 
                  src={assets.guideImg} 
                  alt="Service" 
                  className="w-16 h-16 mb-6 hover:scale-110 duration-300" 
                />
                <h4 className="text-xl font-semibold mb-3 text-white">
                  24/7 Support
                </h4>
                <p className="text-gray-300">
                  Round-the-clock assistance during your journey
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Part 3: Coming Up Tours */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Coming Up Tours
          </h2>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {voyages
                .sort((a, b) => new Date(a.dateDeDepart) - new Date(b.dateDeDepart))
                .slice(0, 3)
                .map((voyage) => (
                <div key={voyage._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img 
                    src={voyage.photo} 
                    alt={voyage.destination} 
                    className="w-full h-56 object-cover" 
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-semibold">{voyage.destination}</h4>
                      <span className="text-green-600 font-bold">
                        {voyage.prix} DH
                      </span>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold">Departure:</span>{' '}
                        {new Date(voyage.dateDeDepart).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold">Return:</span>{' '}
                        {new Date(voyage.dateDeRetour).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Available Places:</span>{' '}
                        {voyage.placesDisponible}
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate(`/tour/${voyage._id}`)}
                      className={`w-full py-2 px-4 rounded-lg transition duration-300 ${
                        voyage.placesDisponible > 0
                          ? 'bg-primary text-white hover:bg-orange-500'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={voyage.placesDisponible <= 0}
                    >
                      {voyage.placesDisponible > 0 ? 'More Details' : 'Tour Full'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Part 4: Popular Associations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Associations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {associations.map((association) => (
              <div key={association._id} className="bg-white rounded-lg shadow-lg p-6 text-center">
                <img 
                  src={association.photo} 
                  alt={association.nom}
                  className="w-full h-32 object-contain mb-4"
                  onError={(e) => {
                    e.target.src = assets.associationImage;
                  }}
                />
                <h4 className="text-lg font-semibold mb-4">{association.nom}</h4>
                <button
                  onClick={() => navigate(`/association/${association._id}`)}
                  className="w-full bg-orange-400 text-white py-2 rounded-lg hover:bg-orange-500 transition-colors duration-300"
                >
                  More Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;