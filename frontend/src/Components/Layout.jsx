import React from 'react'
import Header from './Header'
import Footer from './Footer'
import { Outlet } from 'react-router-dom'
function Layout() {
  return (
    <>
    <div className='bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen min-w-screen'>
    <Header/>
    <Outlet/>
    <Footer/>
    </div>
    </>
  )
}

export default Layout