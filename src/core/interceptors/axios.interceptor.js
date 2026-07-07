import axios from 'axios'

console.log('ENV COMPLETO:', import.meta.env)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export default api
