import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);
      
      // Redirect based on user role
      switch (response.user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'association':
          navigate('/association/dashboard');
          break;
        default:
          navigate('/');
          break;
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // ... rest of your component code ...
};

export default Login; 