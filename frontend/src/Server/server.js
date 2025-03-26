import axios from 'axios';

const backendUrl = String(import.meta.env.VITE_BACKEND_URL);

const login = async (email, password) => {
  const response = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
  console.log(response.data);
  return response.data;
}
const register = async (email, password) => {
  const response = await axios.post(`${backendUrl}/api/auth/register`, { email, password });
  console.log(response.data);
  return response.data;
}

export {
    login,
    register,
}