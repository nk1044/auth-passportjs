import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {

    const navigate = useNavigate()


  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-200'>
        <h1>Home</h1>
        <p>Welcome to the Home page</p>
        <p>Please login or register</p>
        
        <div className='flex space-x-4 mt-5'>
        <button
            onClick={() => navigate('/login')}
            className='bg-blue-500 cursor-pointer hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >Login
        </button>
        <button
            onClick={() => navigate('/register')}
            className='bg-blue-500 cursor-pointer hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >Register
        </button>
        </div>
    </div>
  )
}

export default Home