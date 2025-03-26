import axios from 'axios';

const login = async (email, password) => {
  const response = await axios.post('http://localhost:9000/api/auth/login', { email, password });
  console.log(response.data);
  return response.data;
}
const register = async (email, password) => {
  const response = await axios.post('http://localhost:9000/api/auth/register', { email, password });
  console.log(response.data);
  return response.data;
}

export {
    login,
    register,
}