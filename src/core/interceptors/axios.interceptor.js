import axios from 'axios'

console.log('VITE_API_URL:', JSON.stringify(import.meta.env.VITE_API_URL))
// AUDIT: Cumple con SEG-FE-03 (Configuración de cookies seguras) y OWASP-FE-02 (Prohibición de JWT en localStorage)
// - uses `withCredentials: true` to automatically forward and receive httpOnly cookies (token) in cross-origin requests.
// - Client javascript never accesses or stores the JWT token locally.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export default api
