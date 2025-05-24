import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../Authentication/Authentication.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter> {/* ✅ Router provides context to useNavigate */}
    <AuthProvider> {/* ✅ Now useNavigate will work inside AuthProvider */}
      <App />
      <Toaster position="top-center" reverseOrder={false} />
    </AuthProvider>
  </BrowserRouter>
  // </StrictMode>
)
