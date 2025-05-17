import React from 'react';
import image from "../assets/react.svg";
import dashboardImage from "../assets/dashboardImage.jpg";
import SystemDesignCarousel from "../Components/SysDesignCarousel.jsx";

// Inside return:
<SystemDesignCarousel />


function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center pt-32 px-4 sm:px-6 lg:px-8 overflow-hidden ">

      {/* Glowing semicircle behind the image */}
      <div className="absolute top-[calc(50%-5px)] left-1/2 transform -translate-x-1/2 w-[600px] h-[300px] z-0 pointer-events-none">
        <div className="relative w-full h-full">
          <div className="absolute bottom-0 left-0 w-full h-full 
            bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.6),transparent_60%)]
            rounded-t-full
            shadow-[0_-60px_200px_rgba(255,215,0,0.7)]
            animate-glow-pulse">
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
          <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
          Your playground for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
            System Design Mastery
            </span>
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
        Crack System Design Interviews with Confidence
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-white to-gray-500 text-black font-medium hover:from-gray-100 hover:to-gray-400 transition-all duration-300 shadow-lg shadow-gray-400/20 hover:shadow-gray-400/40">
            Get Started
          </button>
          <a href="https://github.com/Kshitij-Halmare/SystemDesign" target="_blank" rel="noopener noreferrer">
            <button className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-white/10 backdrop-blur-lg text-white font-medium border border-white/20 hover:bg-white/20 transition-all duration-300">
            <img src={image} className="h-5 w-5" alt="GitHub" />
            GitHub
          </button>
          </a>
        </div>

        {/* Dashboard image preview */}
        <div className="relative z-20 mt-10 max-w-4xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gray-800">
          
          <img
            src={dashboardImage}
            alt="Dashboard Preview"
            className="w-full h-auto object-cover relative z-10"
          />
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
  );
}

export default Home;
