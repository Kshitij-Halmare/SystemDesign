import React from 'react';
import { Github, ArrowRight, Play, Star, Users, BookOpen } from 'lucide-react';

function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center pt-20 px-4 sm:px-6 lg:px-8 overflow-hidden ">

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce opacity-25"></div>
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-green-400 rounded-full animate-ping opacity-20"></div>
      </div>

      {/* Enhanced glowing effects */}
      <div className="absolute top-[calc(50%-100px)] left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] z-0 pointer-events-none">
        <div className="relative w-full h-full">
          {/* Primary glow */}
          <div className="absolute bottom-0 left-0 w-full h-full 
            bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.4),rgba(255,165,0,0.2)_40%,transparent_70%)]
            rounded-t-full
            shadow-[0_-60px_200px_rgba(255,215,0,0.5)]
            animate-glow-pulse">
          </div>
          {/* Secondary glow */}
          <div className="absolute bottom-0 left-1/4 w-1/2 h-3/4 
            bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.3),transparent_60%)]
            rounded-t-full
            shadow-[0_-40px_150px_rgba(59,130,246,0.3)]
            animate-glow-pulse-delayed">
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-8 backdrop-blur-sm">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-200">Ace Your System Design Interviews</span>
        </div>

        {/* Main heading with improved typography */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          <span className="block bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Your Playground for
          </span>
          <span className="block mt-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-gradient">
            System Design Mastery
          </span>
        </h1>

        {/* Enhanced subtitle */}
        <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Master the art of system design with hands-on practice, real-world scenarios, and expert guidance
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-4 h-4" />
            <span>10k+ Students</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <BookOpen className="w-4 h-4" />
            <span>50+ Case Studies</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Star className="w-4 h-4" />
            <span>4.9/5 Rating</span>
          </div>
        </div>

        {/* Enhanced CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-2xl shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:scale-105 transform">
            <span className="flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <button className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 backdrop-blur-xl text-white font-semibold border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 transform">
            <Play className="w-4 h-4" />
            Watch Demo
          </button>
          
          <a href="https://github.com/Kshitij-Halmare/SystemDesign" target="_blank" rel="noopener noreferrer">
            <button className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-800/50 backdrop-blur-xl text-white font-semibold border border-gray-700 hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-105 transform">
              <Github className="w-4 h-4" />
              <span>Star on GitHub</span>
            </button>
          </a>
        </div>

        {/* Enhanced dashboard preview */}
        <div className="relative z-20 mt-16 max-w-5xl mx-auto">
          {/* Glow effect behind dashboard */}
          <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 rounded-3xl blur-2xl opacity-75"></div>
          
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
            {/* Browser-like header */}
            <div className="flex items-center gap-2 px-6 py-4 bg-gray-800/80 border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-700/50 rounded-lg px-4 py-2 text-sm text-gray-400">
                  systemdesign-mastery.app
                </div>
              </div>
            </div>
            
            {/* Dashboard content placeholder */}
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Interactive Dashboard</h3>
                <p className="text-gray-400">Real system design scenarios and practice problems</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Design Carousel */}
        <div className="mt-20">
          {/* Uncomment when you have the component */}
          {/* <SystemDesignCarousel /> */}
        </div>
      </div>

      {/* Enhanced keyframe animations */}
      <style jsx>{`
        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.6;
            filter: blur(20px);
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            filter: blur(30px);
            transform: scale(1.05);
          }
        }
        
        @keyframes glow-pulse-delayed {
          0%, 100% {
            opacity: 0.4;
            filter: blur(15px);
            transform: scale(0.95);
          }
          50% {
            opacity: 0.7;
            filter: blur(25px);
            transform: scale(1);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-glow-pulse {
          animation: glow-pulse 4s ease-in-out infinite;
        }
        
        .animate-glow-pulse-delayed {
          animation: glow-pulse-delayed 4s ease-in-out infinite 2s;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Home;