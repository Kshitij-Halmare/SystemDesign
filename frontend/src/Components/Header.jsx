import React from 'react'
import image from "../assets/react.svg"
function Header() {
  return (
    <div className=' h-12 px-5 text-gray-200 font-serif'>
      <div className='h-full flex items-center justify-between'>
        <div className='flex justify-center items-center gap-4'>
          <div className='flex justify-center items-center gap-2'>
            <img src={image} alt='logo' className='h-5 w-5'/>
            <p className='font-extrabold text-xl'>Launch ui</p>
          </div>
          <p>Docs</p>
          <p>Components</p>
          <p>Blocks</p>
          <p>Components</p>
        </div>
        <div className='flex justify-center items-center gap-3'>
          <p>Register</p>
          <p>Signin</p>
           <img src={image} alt='logo' className='h-5 w-5'/>
        </div>
      </div>
    </div>
  )
}

export default Header