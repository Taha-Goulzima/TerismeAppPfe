import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    phone: ''
  });
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      setFormData({
        nom: userData.nom,
        email: userData.email,
        phone: userData.phone
      });
      setLoading(false);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/user/${user._id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update local storage with new user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setUpdateMessage('Profile updated successfully!');
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-orange-400 p-6">
            <h1 className="text-3xl font-bold text-white">Profile</h1>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            {updateMessage && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                {updateMessage}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-orange-400 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition-colors duration-300"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        nom: user.nom,
                        email: user.email,
                        phone: user.phone
                      });
                    }}
                    className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-orange-400">
                      {user.nom.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center border-b py-2">
                    <span className="font-semibold w-24">Name:</span>
                    <span className="text-gray-700">{user.nom}</span>
                  </div>
                  <div className="flex items-center border-b py-2">
                    <span className="font-semibold w-24">Email:</span>
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                  <div className="flex items-center border-b py-2">
                    <span className="font-semibold w-24">Phone:</span>
                    <span className="text-gray-700">{user.phone}</span>
                  </div>
                  <div className="flex items-center border-b py-2">
                    <span className="font-semibold w-24">Role:</span>
                    <span className="text-gray-700 capitalize">{user.role}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-400 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition-colors duration-300"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;