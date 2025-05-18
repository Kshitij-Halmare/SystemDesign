import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import image from "../assets/react.svg";

function Header() {
  return (
    <header className='h-16 px-6  text-gray-200 font-serif shadow-md'>
      <div className='h-full flex items-center justify-between'>
        
        {/* Left: Logo and Nav Links */}
        <div className='flex items-center gap-6'>
          <Link to="/" className='flex items-center gap-2'>
            <img src={image} alt='Launch UI Logo' className='h-6 w-6' />
            <span className='font-extrabold text-xl'>Launch UI</span>
          </Link>

          <nav className='flex gap-4 text-sm'>
            <NavLink 
              to="/docs" 
              className={({ isActive }) => isActive ? "text-gray-400" : "hover:text-white"}>
              Docs
            </NavLink>
            <NavLink 
              to="/components" 
              className={({ isActive }) => isActive ? "text-gray-400" : "hover:text-white"}>
              Components
            </NavLink>
            <NavLink 
              to="/blocks" 
              className={({ isActive }) => isActive ? "text-gray-400" : "hover:text-white"}>
              Blocks
            </NavLink>
            <NavLink 
              to="/templates" 
              className={({ isActive }) => isActive ? "text-gray-400" : "hover:text-white"}>
              Templates
            </NavLink>
          </nav>
        </div>

        {/* Right: Auth Links and Icon */}
        <div className='flex items-center gap-4 text-sm'>
          <NavLink 
            to="/register" 
            className={({ isActive }) => isActive ? "text-gray-400" : "hover:text-white"}>
            Register
          </NavLink>
          <NavLink 
            to="/signin" 
            className={({ isActive }) => isActive ? "text-gray-400" : "hover:text-white"}>
            Signin
          </NavLink>
          <img src={image} alt='Secondary Logo' className='h-5 w-5' />
        </div>
      </div>
    </header>
  );
}

export default Header;
