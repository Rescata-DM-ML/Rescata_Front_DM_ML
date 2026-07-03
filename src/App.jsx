import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Explore from './pages/Explore'
import Perfil from './pages/Perfil'
import AvisoPrivacidad from './pages/AvisoPrivacidad'
import NegocioDashboard from './pages/NegocioDashboard'
import SidebarLayout from './components/shared/SidebarLayout'
import AuthGuard from './core/guards/AuthGuard'
import { useAuthStore } from './features/auth/stores/auth.store'
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
            <Route path="/negocio/dashboard" element={<NegocioDashboard />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
