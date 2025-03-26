import { useState } from 'react'
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Home from './Pages/Home';
import Layout from './Pages/Layout';

const router = createBrowserRouter([{
  path: '/',
  element: <Layout />,
  children: [
    {path: '', element: <Home />},
    {path: 'login', element: <Login />},
    {path: 'register', element: <Register />}
  ]
}]);


function App() {

  return (
    <RouterProvider router={router}>
    </RouterProvider>
  )
}

export default App
