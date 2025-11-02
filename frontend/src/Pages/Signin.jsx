import React from 'react';
import FadeInWrapper from '../Animation/FadeinWrapper';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Authentication/Authentication';
function Signin() {
  const {login}=useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { email, password } = formData;
      if (!email || !password) {
        toast.error("All fields are required");
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/api/user/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!data.success) {
        toast.error(data.message);
        return;
      }
      login(data.token);
      toast.success("User signed in successfully");
      navigate("/");
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FadeInWrapper>
      <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden ">
        {/* Enhanced Glowing semicircle element */}
        <div className="absolute bottom-34 left-1/2 transform -translate-x-1/2 w-[300px] h-[150px] z-0 pointer-events-none">
          <div className="relative w-full h-full">
            <div className="absolute bottom-0 left-0 w-full h-full 
            bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.6),transparent_60%)]
            rounded-t-full
            shadow-[0_-60px_200px_rgba(255,215,0,0.7)]
            animate-glow-pulse">
            </div>
          </div>
        </div>

        {/* Form container */}
        <div className="relative z-10 bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-opacity-20 border-white max-w-md w-full p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back !!</h1>
            <p className="text-gray-300">Learn grow and achieve</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }) }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => { setFormData({ ...formData, password: e.target.value }) }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-lg shadow-md shadow-blue-500/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300">
                Register
              </a>
            </p>
          </div>
        </div>

        {/* Keyframe style */}
        <style jsx>{`
          @keyframes glow-pulse {
            0%, 100% {
              opacity: 0.8;
              filter: blur(2px);
            }
            50% {
              opacity: 1;
              filter: blur(10px);
            }
          }
          .animate-glow-pulse {
            animation: glow-pulse 4s ease-in-out infinite;
          }
        `}</style>
      </div>
    </FadeInWrapper>
  );
}

export default Signin;