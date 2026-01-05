import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthPage({ setIsAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Add these missing functions
  const switchToSignUp = () => {
    setIsLogin(false);
    setErrors({});
    setFormData(prev => ({
      ...prev,
      confirmPassword: ''
    }));
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setErrors({});
    setFormData(prev => ({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false
    }));
  };

  const handleSocialLogin = async (provider) => {
    try {
      // You need to implement or import your authAPI
      const { error } = await authAPI.signInWithProvider(provider.toLowerCase());
      if (error) throw error;
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
      alert(`Error with ${provider} login: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!isLogin) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length === 0) {
      setIsLoading(true);
      try {
        // Note: You need to import authAPI from your Supabase setup
        if (isLogin) {
          // Login
          const { data, error } = await authAPI.signIn(formData.email, formData.password);
          
          if (error) throw error;
          
          setIsAuthenticated(true);
          navigate('/dashboard');
        } else {
          // Register
          const userData = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'student'
          };
          
          const { data, error } = await authAPI.signUp(
            formData.email, 
            formData.password, 
            userData
          );
          
          if (error) throw error;
          
          setIsAuthenticated(true);
          navigate('/dashboard');
        }
      } catch (error) {
        // Better error handling
        if (error.message.includes('Invalid login credentials')) {
          setErrors(prev => ({
            ...prev,
            password: 'Invalid email or password'
          }));
        } else if (error.message.includes('User already registered')) {
          setErrors(prev => ({
            ...prev,
            email: 'Email already registered'
          }));
        } else {
          alert(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Quiz
            <span className="inline-flex items-center justify-center ml-1 px-2 py-1 bg-orange-500 text-black font-bold rounded-md">
              hub
            </span>
          </h1>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {isLogin ? 'Welcome back!' : 'Create Account'}
            </h2>
            <p className="text-gray-400">
              {isLogin ? 'Enter your Credentials' : 'Sign up to get started'}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6">
            {isLogin ? 'Login' : 'Sign Up'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-800 border ${errors.firstName ? 'border-red-500' : 'border-gray-700'} rounded px-4 py-3`}
                      placeholder="John"
                      required={!isLogin}
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-800 border ${errors.lastName ? 'border-red-500' : 'border-gray-700'} rounded px-4 py-3`}
                      placeholder="Doe"
                      required={!isLogin}
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded px-4 py-3`}
                placeholder="Enter your email"
                required
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full bg-gray-800 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded px-4 py-3`}
                placeholder={isLogin ? "Enter your password" : "Create a password"}
                required
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-gray-300 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-800 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700'} rounded px-4 py-3`}
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="rememberMe" className="text-gray-300">
                  Remember me
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Google Button */}
            <button
              onClick={() => handleSocialLogin('Google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-center w-5 h-5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <span>Sign in with Google</span>
            </button>

            {/* Apple Button */}
            <button
              onClick={() => handleSocialLogin('Apple')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-center w-5 h-5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </div>
              <span>Sign in with Apple</span>
            </button>
          </div>

          {/* Switch between Login and Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {isLogin ? "No account? " : "Already have an account? "}
              <button
                type="button"
                onClick={isLogin ? switchToSignUp : switchToLogin}
                className="ml-2 text-blue-400 font-semibold hover:text-blue-300"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;