import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Explore from './pages/Explore'
import AvisoPrivacidad from './pages/AvisoPrivacidad'
import AuthGuard from './core/guards/AuthGuard'
import { useAuthStore } from './features/auth/stores/auth.store'
import './App.css'

function RootRedirect() {
  const isAuth = useAuthStore((state) => state.isAuth)
  return <Navigate to={isAuth ? '/explore' : '/login'} replace />
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
          <Route path="/explore" element={<Explore />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
