import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Home() {
  const [voyages, setVoyages] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchVoyages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/association');
        const allVoyages = response.data.associations.reduce((acc, association) => {
          if (association.voyages && association.voyages.length > 0) {
            return [...acc, ...association.voyages.map(voyage => ({
              ...voyage,
              association: association.nom
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

  const navigate = useNavigate();

  const filteredVoyages = activeTab === 'all' 
    ? voyages 
    : voyages.filter(voyage => voyage.placesDisponible > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Parallax Effect */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={assets.heroImg02} 
            alt="Hero" 
            className="w-full h-full object-cover transform scale-110"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Discover Your Next Adventure
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
          >
                  Embark on unforgettable journeys with our carefully curated tours. 
                  From breathtaking landscapes to cultural experiences, we connect you 
            with the world's most amazing destinations.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            onClick={() => navigate('/tours')}
            className="bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Explore Tours
          </motion.button>
        </div>
      </section>

      {/* Features Section with Animated Cards */}
      <section className="py-20 bg-gradient-to-br from-orange-5 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-primary text-sm uppercase tracking-wider mb-2 block"
            >
              Why Choose Us
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-bold text-gray-800"
            >
              Experience Travel Like Never Before
            </motion.h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: assets.weatherImg,
                title: "Customized Tours",
                description: "Personalized itineraries tailored to your preferences"
              },
              {
                icon: assets.costomizationImg,
                title: "Expert Guides",
                description: "Professional and knowledgeable local guides"
              },
              {
                icon: assets.guideImg,
                title: "24/7 Support",
                description: "Round-the-clock assistance during your journey"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-orange-100 rounded-full p-3 flex items-center justify-center">
                  <img 
                    src={feature.icon} 
                    alt={feature.title}
                    className="w-full h-full object-contain filter invert-[0.3] sepia-[0.5] saturate-[2] hue-rotate-[340deg] brightness-[0.9]"
                  />
                </div>
                <h3 className="text-xl font-semibold text-center mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Tours Section with Tabs */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-primary text-sm uppercase tracking-wider mb-2 block"
            >
              Discover
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-bold text-gray-800"
            >
              Upcoming Adventures
            </motion.h2>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-1 shadow-md">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  activeTab === 'all'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                All Tours
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  activeTab === 'available'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Available Tours
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVoyages
                .sort((a, b) => new Date(a.dateDeDepart) - new Date(b.dateDeDepart))
                .slice(0, 3)
                .map((voyage, index) => (
                  <motion.div
                    key={voyage._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className="relative h-64">
                      <img 
                        src={voyage.photo} 
                        alt={voyage.destination} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-2xl font-bold text-white mb-2">{voyage.destination}</h4>
                        <div className="flex items-center text-white/90">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{new Date(voyage.dateDeDepart).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-primary">{voyage.prix} DH</span>
                        <span className="text-sm text-gray-600">{voyage.placesDisponible} places left</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/tour/${voyage._id}`)}
                        className={`w-full py-3 rounded-lg transition-all duration-300 ${
                          voyage.placesDisponible > 0
                          ? 'bg-primary text-white hover:bg-orange-500'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                        disabled={voyage.placesDisponible <= 0}
                    >
                        {voyage.placesDisponible > 0 ? 'View Details' : 'Tour Full'}
                    </button>
                  </div>
                  </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Associations Section with Modern Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-primary text-sm uppercase tracking-wider mb-2 block"
            >
              Our Partners
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-bold text-gray-800"
            >
              Trusted Travel Associations
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 text-gray-600 max-w-2xl mx-auto"
            >
              Discover our trusted travel partners who bring unique experiences and unforgettable adventures to life.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {associations.map((association, index) => (
              <motion.div
                key={association._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`group relative bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 ${
                  association.status === 'inactive' ? 'opacity-50' : ''
                }`}
              >
                <div className="relative h-48">
                <img 
                  src={association.photo} 
                  alt={association.nom}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = assets.associationImage;
                  }}
                />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                    association.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {association.status === 'active' ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-primary transition-colors duration-300">
                    {association.nom}
                  </h4>
                  
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Active Members</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Active Tours</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {association.description}
                  </p>

                  <div className="flex items-center justify-between mb-6 text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{association.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{association.phone}</span>
                    </div>
                  </div>

                <button
                  onClick={() => navigate(`/association/${association._id}`)}
                    className={`w-full bg-primary text-white py-3 rounded-lg hover:bg-orange-500 transition-all duration-300 flex items-center justify-center group ${
                      association.status === 'inactive' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={association.status === 'inactive'}
                >
                    {association.status === 'active' ? 'View Details' : 'Inactive Association'}
                </button>
              </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;