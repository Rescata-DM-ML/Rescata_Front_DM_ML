import axios from 'axios'

console.log('=== API URL IS: ', import.meta.env.VITE_API_URL, ' ===')
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export default api
