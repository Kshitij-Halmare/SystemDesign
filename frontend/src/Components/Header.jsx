import React, { useState, useEffect } from 'react';
import { Menu, X, Github, LogIn, UserPlus, Zap } from 'lucide-react';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = (path) => {
    setActiveLink(path);
    setIsMobileMenuOpen(false);
  };

  const NavItem = ({ to, children, mobile = false }) => {
    const isActive = activeLink === to;
    const baseClasses = mobile 
      ? "block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300"
      : "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300";
    
    const activeClasses = isActive 
      ? "bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-400 border border-yellow-400/30" 
      : "text-gray-300 hover:text-white hover:bg-white/10";

    return (
      <button
        onClick={() => handleLinkClick(to)}
        className={`${baseClasses} ${activeClasses}`}
      >
        {children}
      </button>
    );
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'h-16 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
          : 'h-20 bg-transparent'
      }`}>
        <div className='h-full px-6 lg:px-8'>
          <div className='h-full flex items-center justify-between'>
            
            {/* Left: Logo and Nav Links */}
            <div className='flex items-center gap-8'>
              <button onClick={() => handleLinkClick('/')} className='flex items-center gap-3 group'>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-black" />
                  </div>
                </div>
                <span className='font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-yellow-400 group-hover:to-orange-400 transition-all duration-300'>
                  SystemDesign Pro
                </span>
              </button>

              {/* Desktop Navigation */}
              <nav className='hidden lg:flex gap-1'>
                <NavItem to="/problems">Problems</NavItem>
                <NavItem to="/components">Components</NavItem>
                <NavItem to="/blocks">Blocks</NavItem>
                <NavItem to="/templates">Templates</NavItem>
              </nav>
            </div>

            {/* Right: Auth Links and Actions */}
            <div className='flex items-center gap-3'>
              
              {/* GitHub Link */}
              <a 
                href="https://github.com/Kshitij-Halmare/SystemDesign" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <Github className="w-4 h-4" />
                <span className="hidden md:inline">GitHub</span>
              </a>

              {/* Desktop Auth Links */}
              <div className='hidden lg:flex items-center gap-2'>
                <button 
                  onClick={() => handleLinkClick('/signin')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeLink === '/signin'
                      ? "bg-white/10 text-white" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                
                <button 
                  onClick={() => handleLinkClick('/register')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeLink === '/register'
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black" 
                      : "bg-gradient-to-r from-yellow-400/90 to-orange-500/90 text-black hover:from-yellow-400 hover:to-orange-500 shadow-lg shadow-yellow-500/25"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  Get Started
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-black/95 backdrop-blur-xl border-t border-white/10">
            <nav className="px-6 py-4 space-y-2">
              <NavItem to="/problems" mobile>Problems</NavItem>
              <NavItem to="/components" mobile>Components</NavItem>
              <NavItem to="/blocks" mobile>Blocks</NavItem>
              <NavItem to="/templates" mobile>Templates</NavItem>
              
              <div className="pt-4 border-t border-white/10 space-y-2">
                <button 
                  onClick={() => handleLinkClick('/signin')}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 w-full text-left"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button 
                  onClick={() => handleLinkClick('/register')}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 w-full text-left"
                >
                  <UserPlus className="w-4 h-4" />
                  Get Started
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className={`transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}></div>
    </>
  );
}

export default Header;