import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getApiUrl } from './config';

export default function SignInForm() {
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [focusedInput, setFocusedInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSignInData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(signInData)
      });

      const result = await response.json();

      if (response.ok) {
        // Save token and user info
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("token", "dummy_token"); // You can generate JWT later if needed
        alert("Login successful!");

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        alert(result.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSocialLogin = (platform) => {
    alert(`${platform} login clicked - integrate with actual OAuth`);
  };

  const handleForgotPassword = () => {
    alert("Forgot password clicked - implement password reset flow");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4 font-sans">
      <div className="bg-black bg-opacity-25 backdrop-blur-md rounded-3xl p-10 w-full max-w-md border border-white border-opacity-15 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sign in</h1>
          <p className="text-white text-opacity-70 text-sm mb-6">Sign in with:</p>

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

          <p className="text-white text-opacity-60 text-sm mb-6">Or</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <label className="text-white text-opacity-85 text-sm mb-2 font-medium">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={signInData.email}
              onChange={handleInputChange}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              className={`w-full bg-white bg-opacity-95 border-none rounded-xl py-3.5 px-4 text-gray-700 text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:ring-3 focus:ring-yellow-400 focus:ring-opacity-30 focus:-translate-y-0.5 ${focusedInput === 'email' ? 'bg-white ring-3 ring-yellow-400 ring-opacity-30 -translate-y-0.5' : ''
                }`}
              placeholder="Enter your email"
            />
          </div>

          <div className="flex flex-col">
            <div className="relative">
              <label className="text-white text-opacity-85 text-sm mb-2 font-medium block">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="absolute right-0 top-0 text-yellow-400 text-xs hover:text-yellow-300 hover:underline transition-colors duration-200 focus:outline-none focus:underline"
              >
                Forgot password?
              </button>
              <div className="relative flex items-center mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={signInData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Enter your password"
                  className={`w-full bg-white bg-opacity-95 border-none rounded-xl py-3.5 pl-4 pr-12 text-gray-700 text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:ring-3 focus:ring-yellow-400 focus:ring-opacity-30 focus:-translate-y-0.5 ${focusedInput === 'password' ? 'bg-white ring-3 ring-yellow-400 ring-opacity-30 -translate-y-0.5' : ''
                    }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg p-1 rounded hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignIn}
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
                {isLoading ? 'Signing in...' : 'Sign in'}
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

          <p className="text-white text-opacity-80 text-sm text-center mt-4">
            Don't have an account yet?{' '}
            <span
              className="text-yellow-400 cursor-pointer hover:text-yellow-300 hover:underline transition-all duration-200 focus:outline-none focus:underline"
              onClick={() => navigate('/register')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate('/register');
                }
              }}
              tabIndex={0}
              role="button"
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}