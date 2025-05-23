import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state
  useEffect(() => {
    const token = localStorage.getItem('blog_user_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log(decoded);
        setUser(decoded);  
      } catch (error) {
        console.error('Invalid token', error);
      }
    }
    setLoading(false); // After checking, set loading to false
  }, []);

  const login = (token) => {
    const decoded = jwtDecode(token);
    console.log(decoded);
    setUser(decoded);
    localStorage.setItem('blog_user_token', token); // Store the token in localStorage
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('blog_user_token'); 
    
  };

  if (loading) {
    return <div>Loading...</div>; // Render loading indicator while checking the token
  }

  return (
    <AuthContext.Provider value={{ user, login, signOut,setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return React.useContext(AuthContext);
};