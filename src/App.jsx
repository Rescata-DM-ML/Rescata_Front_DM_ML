import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Explore from './pages/Explore'
import Perfil from './pages/Perfil'
import ProductDetail from './pages/ProductDetail'
import BusinessCatalog from './pages/BusinessCatalog'
import AvisoPrivacidad from './pages/AvisoPrivacidad'
import NegocioDashboard from './pages/NegocioDashboard'
import NegocioPedidos from './pages/NegocioPedidos'
import Reservas from './pages/Reservas'
import PublicarProducto from './pages/PublicarProducto'
import SidebarLayout from './components/shared/SidebarLayout'
import AuthGuard from './core/guards/AuthGuard'
import { useAuthStore } from './features/auth/stores/auth.store'
import api from './core/interceptors/axios.interceptor'
import './App.css'

function RootRedirect() {
  const isAuth = useAuthStore((state) => state.isAuth)
  const user = useAuthStore((state) => state.user)

  if (isAuth) {
    return <Navigate to={user?.rol === 'negocio' ? '/negocio/dashboard' : '/explore'} replace />
  }
  return <Navigate to="/login" replace />
}

function App() {
  const { setUser, clearUser } = useAuthStore()
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/usuarios/me')
        const wrappedData = response.data.data ? response.data.data : response.data
        const userData = {
          id: wrappedData.user?.id || wrappedData.id,
          nombre: wrappedData.user?.nombre || wrappedData.nombre,
          correo: wrappedData.user?.correo || wrappedData.correo,
          rol: wrappedData.user?.rol || wrappedData.rol || 'consumidor',
          negocio: wrappedData.user?.negocio || wrappedData.negocio || null,
        }
        setUser(userData)
      } catch (err) {
        console.warn('Session verification failed:', err.message)
        clearUser()
      } finally {
        setIsCheckingSession(false)
      }
    }
    checkSession()
  }, [setUser, clearUser])

  if (isCheckingSession) {
    return (
      <div className="app-splash-screen">
        <div className="app-splash-spinner-container">
          <svg
            className="app-splash-spinner"
            viewBox="0 0 24 24"
            width="40"
            height="40"
            stroke="#16A34A"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="42 20"></circle>
          </svg>
          <span className="app-splash-text">Verificando sesión...</span>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/aviso-privacidad" element={<AvisoPrivacidad />} />

        {/* Rutas Protegidas */}
        <Route element={<AuthGuard />}>
          <Route element={<SidebarLayout />}>
            <Route path="/explore" element={<Explore />} />
            <Route path="/productos/:id" element={<ProductDetail />} />
            <Route path="/negocio/:id" element={<BusinessCatalog />} />
            <Route path="/negocio/dashboard" element={<NegocioDashboard />} />
            <Route path="/negocio/pedidos" element={<NegocioPedidos />} />
            <Route path="/negocio/publicar" element={<PublicarProducto />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/reservas" element={<Reservas />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
