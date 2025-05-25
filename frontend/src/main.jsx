import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../Authentication/Authentication.jsx'
import { ProblemStoreProvider } from './Components/ProblemInputStore.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter> 
    <AuthProvider>
      <ProblemStoreProvider> 
      <App />
      <Toaster position="top-center" reverseOrder={false} />
      </ProblemStoreProvider>
    </AuthProvider>
  </BrowserRouter>
  // </StrictMode>
)
