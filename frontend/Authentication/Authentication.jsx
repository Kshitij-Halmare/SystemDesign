import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token,setToken]=useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('blog_user_token');

    if (token) {
      try {
        setToken(token);
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('blog_user_token');
        setUser(null);

        if (!['/signin', '/register'].includes(location.pathname)) {
          toast.error('Session expired. Please sign in again.');
          navigate('/signin');
        }
      }
    } else {
      setUser(null);

      if (!['/signin', '/register'].includes(location.pathname)) {
        toast.error('Please sign in or register');
        navigate('/signin');
      }
    }

    setLoading(false);
  }, [navigate, location]);

  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      console.log(decoded);
      localStorage.setItem('blog_user_token', token);
    } catch (error) {
      console.error('Login failed: invalid token');
      toast.error('Login failed');
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('blog_user_token');
    navigate('/signin');
  };

  if (loading) {
    return <div className="text-center text-white mt-10">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, signOut, setUser, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
