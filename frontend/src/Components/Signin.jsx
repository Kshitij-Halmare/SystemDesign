import React from 'react'
import FadeInWrapper from '../Animation/FadeinWrapper';

function Signin() {
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
      <div className="relative z-10  bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-opacity-20 border-white max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back !!</h1>
          <p className="text-gray-300">Learn grow and achieve</p>
        </div>
        
        <form className="space-y-6">
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="your@email.com"
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
            />
          </div>
          
          
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 focus:ring-blue-500 focus:ring-offset-gray-900 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            Signin
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Do not have an account?{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300">
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

export default Signin