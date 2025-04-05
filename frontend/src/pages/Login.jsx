import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  const { login, api } = useAuth();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (state === 'Sign Up') {
        // Validation for signup
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Validate password length
        if (password.length < 8) {
          setError('Password must be at least 8 characters long');
          setLoading(false);
          return;
        }

        // Validate phone number format
        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(phone)) {
          setError('Phone number must be between 10 and 15 digits');
          setLoading(false);
          return;
        }

        // Sign up request
        const response = await api.post('/user/register', {
          nom: username,
          email,
          password,
          phone,
          role: 'user'
        });

        if (response.data.user) {
          // Automatically log in after successful registration
          await login({ email, password });
          navigate('/');
        }
      } else {
        // Login request
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
    <form className='min-h-[80vh] flex items-center' onSubmit={onSubmitHandler}>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book a tour</p>

        {error && <p className="text-red-500 w-full text-center">{error}</p>}

        {state === 'Sign Up' && (
          <>
            <div className='w-full'>
              <p>Full Name</p>
              <input 
                className='border border-zinc-300 rounded w-full p-2 mt-1 bg-[#FFF9DD]' 
                type='text' 
                onChange={(e) => setUsername(e.target.value)} 
                value={username} 
                required 
                disabled={loading}
              />
            </div>
            <div className='w-full'>
              <p>Phone</p>
              <input 
                className='border border-zinc-300 rounded w-full p-2 mt-1 bg-[#FFF9DD]' 
                type='text' 
                onChange={(e) => setPhone(e.target.value)} 
                value={phone} 
                required 
                disabled={loading}
              />
            </div>
          </>
        )}

        <div className='w-full'>
          <p>Email</p>
          <input 
            className='border border-zinc-300 rounded w-full p-2 mt-1 bg-[#FFF9DD]' 
            type='email' 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            required 
            disabled={loading}
          />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input 
            className='border border-zinc-300 rounded w-full p-2 mt-1 bg-[#FFF9DD]' 
            type='password' 
            onChange={(e) => setPassword(e.target.value)} 
            value={password} 
            required 
            disabled={loading}
          />
        </div>

        {state === 'Sign Up' && (
          <div className='w-full'>
            <p>Confirm Password</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1 bg-[#FFF9DD]"
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              required
              disabled={loading}
            />
          </div>
        )}

        <button 
          type='submit' 
          className='bg-primary text-white w-full py-2 rounded-md text-base disabled:opacity-50'
          disabled={loading}
        >
          {loading ? 'Please wait...' : (state === 'Sign Up' ? 'Create Account' : 'Login')}
        </button>

        {state === 'Sign Up' ? (
          <p>Already have an account? <span onClick={() => !loading && setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
        ) : (
          <p>Create a new account? <span onClick={() => !loading && setState('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span></p>
        )}
      </div>
    </form>
  );
}

export default Login;