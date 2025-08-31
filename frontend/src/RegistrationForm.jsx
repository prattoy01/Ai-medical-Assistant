import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { getApiUrl } from './config';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    age: '',
    gender: 'female'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.age) newErrors.age = 'Age is required';
    else if (formData.age < 1 || formData.age > 120) newErrors.age = 'Age must be between 1 and 120';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(getApiUrl("/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Registration successful! Please sign in.');
        navigate('/login');
      } else {
        alert(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    alert(`${platform} registration clicked - integrate with actual OAuth`);
  };

  const handleTermsClick = () => {
    alert('Terms of Service clicked - link to actual terms page');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4 font-sans">
      <div className="bg-black bg-opacity-25 backdrop-blur-md rounded-3xl p-10 w-full max-w-md border border-white border-opacity-15 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-white text-opacity-70 text-sm mb-6">Register with:</p>

          {/* Social Login Buttons */}
          <div className="flex gap-3 mb-6">
            {['Google', 'Github', 'Gitlab'].map((platform) => (
              <button
                key={platform}
                onClick={() => handleSocialLogin(platform)}
                className="flex-1 flex items-center justify-center gap-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl py-3 px-2 text-white text-sm cursor-pointer transition-all duration-300 hover:bg-opacity-20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
              >
                <span className="w-5 h-5 bg-white rounded text-black font-bold text-xs flex items-center justify-center">
                  {platform.charAt(0)}
                </span>
                {platform}
              </button>
            ))}
          </div>

          <p className="text-white text-opacity-60 text-sm">Or</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-white text-opacity-85 text-sm mb-2 font-medium">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput('firstName')}
                onBlur={() => setFocusedInput(null)}
                className={`w-full bg-white bg-opacity-95 border-none rounded-xl py-3.5 px-4 text-gray-700 text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:ring-3 focus:ring-yellow-400 focus:ring-opacity-30 focus:-translate-y-0.5 ${
                  focusedInput === 'firstName' ? 'bg-white ring-3 ring-yellow-400 ring-opacity-30 -translate-y-0.5' : ''
                } ${errors.firstName ? 'ring-2 ring-red-400' : ''}`}
                placeholder="First Name"
              />
              {errors.firstName && <span className="text-red-400 text-xs mt-1">{errors.firstName}</span>}
            </div>
            <div className="flex flex-col">
              <label className="text-white text-opacity-85 text-sm mb-2 font-medium">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput('lastName')}
                onBlur={() => setFocusedInput(null)}
                className={`w-full bg-white bg-opacity-95 border-none rounded-xl py-3.5 px-4 text-gray-700 text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:ring-3 focus:ring-yellow-400 focus:ring-opacity-30 focus:-translate-y-0.5 ${
                  focusedInput === 'lastName' ? 'bg-white ring-3 ring-yellow-400 ring-opacity-30 -translate-y-0.5' : ''
                } ${errors.lastName ? 'ring-2 ring-red-400' : ''}`}
                placeholder="Last Name"
              />
              {errors.lastName && <span className="text-red-400 text-xs mt-1">{errors.lastName}</span>}
            </div>
          </div>

          {/* Username */}
          <div className="flex flex-col">
            <label className="text-white text-opacity-85 text-sm mb-2 font-medium">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onFocus={() => setFocusedInput('username')}
              onBlur={() => setFocusedInput(null)}
              className={`w-full bg-white bg-opacity-95 border-none rounded-xl py-3.5 px-4 text-gray-700 text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:ring-3 focus:ring-yellow-400 focus:ring-opacity-30 focus:-translate-y-0.5 ${
                focusedInput === 'username' ? 'bg-white ring-3 ring-yellow-400 ring-opacity-30 -translate-y-0.5' : ''
              } ${errors.username ? 'ring-2 ring-red-400' : ''}`}
              placeholder="Username"
            />
            {errors.username && <span className="text-red-400 text-xs mt-1">{errors.username}</span>}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-white text-opacity-85 text-sm mb-2 font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              className={`w-full bg-white bg-opacity-95 border-none rounded-xl py-3.5 px-4 text-gray-700 text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:ring-3 focus:ring-yellow-400 focus:ring-opacity-30 focus:-translate-y-0.5 ${
                focusedInput === 'email' ? 'bg-white ring-3 ring-yellow-400 ring-opacity-30 -translate-y-0.5' : ''
              } ${errors.email ? 'ring-2 ring-red-400' : ''}`}
              placeholder="Email"
            />
            {errors.email && <span className="text-red-400 text-xs mt-1">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-white text-opacity-85 text-sm mb-2 font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                className={`w-full bg-white bg-opacity-95 border-none rounded-xl py-3.5 pl-4 pr-12 text-gray-700 text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:ring-3 focus:ring-yellow-400 focus:ring-opacity-30 focus:-translate-y-0.5 ${
                  focusedInput === 'password' ? 'bg-white ring-3 ring-yellow-400 ring-opacity-30 -translate-y-0.5' : ''
                } ${errors.password ? 'ring-2 ring-red-400' : ''}`}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="text-red-400 text-xs mt-1">{errors.password}</span>}
            <p className="text-white text-opacity-60 text-xs mt-1.5">
              Minimum length is 8 characters.
            </p>
          </div>

          {/* Age and Gender Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-white text-opacity-85 text-sm mb-2 font-medium">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput('age')}
                onBlur={() => setFocusedInput(null)}
                className={`w-full bg-white bg-opacity-95 border-none rounded-xl py-3.5 px-4 text-gray-700 text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:ring-3 focus:ring-yellow-400 focus:ring-opacity-30 focus:-translate-y-0.5 ${
                  focusedInput === 'age' ? 'bg-white ring-3 ring-yellow-400 ring-opacity-30 -translate-y-0.5' : ''
                } ${errors.age ? 'ring-2 ring-red-400' : ''}`}
                placeholder="Age"
                min="1"
                max="120"
              />
              {errors.age && <span className="text-red-400 text-xs mt-1">{errors.age}</span>}
            </div>
            <div className="flex flex-col">
              <label className="text-white text-opacity-85 text-sm mb-2 font-medium">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput('gender')}
                onBlur={() => setFocusedInput(null)}
                className={`w-full bg-white bg-opacity-95 border-none rounded-xl py-3.5 px-4 text-gray-700 text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:ring-3 focus:ring-yellow-400 focus:ring-opacity-30 focus:-translate-y-0.5 ${
                  focusedInput === 'gender' ? 'bg-white ring-3 ring-yellow-400 ring-opacity-30 -translate-y-0.5' : ''
                }`}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-none rounded-2xl py-5 px-6 text-black font-bold text-lg cursor-pointer transition-all duration-500 shadow-2xl shadow-amber-500/50 hover:-translate-y-2 hover:shadow-3xl hover:shadow-amber-400/60 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-amber-300/70 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:scale-100 overflow-hidden group"
          >
            {/* Animated background shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            {/* Button content */}
            <div className="relative flex items-center justify-center gap-3">
              {isLoading && (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              )}
              <span className="tracking-wide">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </span>
              {!isLoading && (
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </div>
          </button>

          {/* Terms and Sign In Link */}
          <div className="text-center">
            <p className="text-white text-opacity-60 text-xs mb-4">
              By creating an account, you agree to our{' '}
              <span
                className="text-yellow-400 cursor-pointer hover:text-yellow-300 hover:underline transition-all duration-200 focus:outline-none focus:underline"
                onClick={handleTermsClick}
              >
                Terms of Service
              </span>
            </p>
            <p className="text-white text-opacity-80 text-sm">
              Already have an account?{' '}
              <span
                className="text-yellow-400 cursor-pointer hover:text-yellow-300 hover:underline transition-all duration-200 focus:outline-none focus:underline"
                onClick={() => navigate('/login')}
              >
                Sign in
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}