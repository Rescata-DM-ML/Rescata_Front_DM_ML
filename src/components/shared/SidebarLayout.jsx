import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/stores/auth.store'
import api from '../../core/interceptors/axios.interceptor'
import './SidebarLayout.css'

export default function SidebarLayout() {
  const { user, clearUser } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      // Intentar llamar a logout del backend
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Error al cerrar sesión en el servidor:', err)
    } finally {
      // Limpiar el estado de Zustand
      clearUser()
    }
  }

  // Iconos SVG
  const mapPinIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )

  const userIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )

  const storeIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )

  const logoutIcon = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )

  const hamburgerIcon = (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )

  const isNegocio = user?.role === 'negocio' || user?.rol === 'negocio' // Soportar ambos campos por si acaso

  return (
    <div className="explore-page-container">
      {/* Overlay móvil */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} 
        onClick={() => setSidebarOpen(false)} 
      />

      {/* Menú Lateral (Sidebar) */}
      <aside className={`explore-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="explore-sidebar-brand">
          <Link to="/" className="logo-container" onClick={() => setSidebarOpen(false)}>
            <svg
              viewBox="0 0 24 24"
              width="36"
              height="36"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="brand-name">RESCATA</span>
          </Link>
        </div>

        <nav className="explore-sidebar-menu">
          {isNegocio ? (
            <NavLink 
              to="/negocio/dashboard" 
              className={({ isActive }) => `explore-sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {storeIcon}
              <span>Mis Productos</span>
            </NavLink>
          ) : (
            <NavLink 
              to="/explore" 
              className={({ isActive }) => `explore-sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {mapPinIcon}
              <span>Productos cerca de mí</span>
            </NavLink>
          )}
          
          <NavLink 
            to="/perfil" 
            className={({ isActive }) => `explore-sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            {userIcon}
            <span>Mi Perfil</span>
          </NavLink>
        </nav>

        <div className="explore-sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            {logoutIcon}
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="explore-main-content">
        {/* Navbar móvil */}
        <header className="mobile-navbar">
          <button 
            className="mobile-hamburger-btn" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            {hamburgerIcon}
          </button>
          <div className="mobile-navbar-brand">
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="brand-name">RESCATA</span>
          </div>
          <div style={{ width: '40px' }} /> {/* Espaciador para centrar logo */}
        </header>

        {/* Aquí se renderiza la vista activa */}
        <Outlet />
      </div>
    </div>
  )
}
