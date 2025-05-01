import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axios';

function Login() {
  const [state, setState] = useState('Login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (state === 'Sign Up') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (password.length < 8) {
          setError('Password must be at least 8 characters long');
          setLoading(false);
          return;
        }

        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(phone)) {
          setError('Phone number must be between 10 and 15 digits');
          setLoading(false);
          return;
        }

        const response = await api.post('/user/register', {
          nom: username,
          email,
          password,
          phone,
          role: 'user'
        });

        if (response.data.user) {
          await login({ email, password });
          navigate('/');
        }
      } else {
        await login({ email, password });
        navigate('/');
      }
    } catch (err) {
      console.error('Registration/Login error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'An error occurred during registration/login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="relative h-32 bg-gradient-to-r from-orange-400 to-orange-500">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative w-20 h-20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-orange-500">
                    {state === 'Sign Up' ? 'S' : 'L'}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-800">
                {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-500 mt-2">
                {state === 'Sign Up' ? 'Join us to start your journey' : 'Sign in to continue'}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={onSubmitHandler} className="space-y-6">
              <AnimatePresence mode="wait">
                {state === 'Sign Up' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        person
                      </span>
                      <input 
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                        type="text" 
                        placeholder="Full Name"
                        onChange={(e) => setUsername(e.target.value)} 
                        value={username} 
                        required 
                        disabled={loading}
                      />
                    </div>

                    <div className="relative">
                      <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        phone
                      </span>
                      <input 
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                        type="text" 
                        placeholder="Phone Number"
                        onChange={(e) => setPhone(e.target.value)} 
                        value={phone} 
                        required 
                        disabled={loading}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  email
                </span>
                <input 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                  type="email" 
                  placeholder="Email Address"
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email} 
                  required 
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  lock
                </span>
                <input 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                  type="password" 
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)} 
                  value={password} 
                  required 
                  disabled={loading}
                />
              </div>

              <AnimatePresence mode="wait">
                {state === 'Sign Up' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="relative"
                  >
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      lock
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                      type="password"
                      placeholder="Confirm Password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      value={confirmPassword}
                      required
                      disabled={loading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Please wait...
                  </div>
                ) : (
                  state === 'Sign Up' ? 'Create Account' : 'Sign In'
                )}
              </motion.button>

              <div className="text-center">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600"
                >
                  {state === 'Sign Up' ? (
                    <>Already have an account?{' '}
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        onClick={() => !loading && setState('Login')}
                        className="text-orange-500 font-medium cursor-pointer hover:underline"
                      >
                        Sign in here
                      </motion.span>
                    </>
                  ) : (
                    <>Don't have an account?{' '}
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        onClick={() => !loading && setState('Sign Up')}
                        className="text-orange-500 font-medium cursor-pointer hover:underline"
                      >
                        Create one here
                      </motion.span>
                    </>
                  )}
                </motion.p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;