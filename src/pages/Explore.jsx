import { useRef, useEffect, useState } from 'react'
import { useAuthStore } from '../features/auth/stores/auth.store'
import useGetProductosCercanos from '../features/productos/hooks/useGetProductosCercanos'
import GeolocationBanner from '../components/shared/GeolocationBanner'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'
import ProductFeedCard from '../components/shared/ProductFeedCard'
import './Explore.css'

export default function Explore() {
  const { user, clearUser } = useAuthStore()
  const {
    productos,
    cargando,
    cargandoMas,
    error,
    hayMas,
    permisoGeo,
    estadoPermisoNativo,
    coordenadas,
    solicitarGeolocalizacion,
    denegarPermisoManual,
    cargarMas,
  } = useGetProductosCercanos()

  const [activeTab, setActiveTab] = useState('cercanos')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sentinelRef = useRef(null)

  console.log('[DEBUG] Explore Render - activeTab:', activeTab, 'permisoGeo:', permisoGeo, 'estadoPermisoNativo:', estadoPermisoNativo, 'coords:', coordenadas, 'productos:', productos.length)

  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hayMas && !cargando && !cargandoMas) {
          cargarMas()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinelRef.current)
    return () => {
      observer.disconnect()
    }
  }, [hayMas, cargando, cargandoMas, cargarMas])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSidebarOpen(false) // Cerrar sidebar en móviles tras elegir opción
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

  return (
    <div className="explore-page-container">
      {/* Overlay para móviles */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} 
        onClick={() => setSidebarOpen(false)} 
      />

      {/* Menú Lateral (Sidebar) */}
      <aside className={`explore-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="explore-sidebar-brand">
          <div className="logo-container">
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
          </div>
        </div>

        <nav className="explore-sidebar-menu">
          <button 
            className={`explore-sidebar-item ${activeTab === 'cercanos' ? 'active' : ''}`}
            onClick={() => handleTabChange('cercanos')}
          >
            {mapPinIcon}
            <span>Productos cerca de mí</span>
          </button>
          
          <button 
            className={`explore-sidebar-item ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => handleTabChange('perfil')}
          >
            {userIcon}
            <span>Mi Perfil</span>
          </button>
        </nav>

        <div className="explore-sidebar-footer">
          <button onClick={clearUser} className="logout-btn">
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
          <div style={{ width: '40px' }} /> {/* Espaciador balanceador */}
        </header>

        {/* Vista: Mi Perfil */}
        {activeTab === 'perfil' && (
          <main className="profile-section-container">
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="profile-avatar-placeholder">
                  {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                </div>
                <h1 className="welcome-title">¡Bienvenido, {user?.nombre || 'Usuario'}!</h1>
                <p className="welcome-subtitle">
                  Tu cuenta de consumidor está activa y has iniciado sesión.
                </p>
              </div>

              <div className="profile-details-card">
                <h3>Datos de tu Sesión</h3>
                <div className="detail-item">
                  <span className="detail-label">ID de Usuario:</span>
                  <span className="detail-value mono-text">{user?.id || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Nombre:</span>
                  <span className="detail-value">{user?.nombre || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Correo:</span>
                  <span className="detail-value">{user?.correo || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Rol:</span>
                  <span className="detail-value badge">{user?.rol || 'consumidor'}</span>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Vista: Productos cerca de mí */}
        {activeTab === 'cercanos' && (
          <main className="explore-feed-section">
            <h2 className="explore-section-title">Ofertas Cercanas Rescatables</h2>

            {/* Caso A: Nunca ha solicitado permisos (el estado de geolocalización en navegador es 'prompt' y la app está limpia) */}
            {estadoPermisoNativo === 'prompt' && permisoGeo === 'pending' && (
              <GeolocationBanner
                onAceptar={solicitarGeolocalizacion}
                onRechazar={denegarPermisoManual}
              />
            )}

            {/* Caso B: El usuario dio a "Ahora no" en nuestro banner (Rechazo temporal en la app, pero en el navegador sigue en 'prompt') */}
            {estadoPermisoNativo === 'prompt' && permisoGeo === 'denied' && (
              <div className="fallback-banner">
                <svg
                  viewBox="0 0 24 24"
                  width="36"
                  height="36"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="fallback-banner-icon"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div className="fallback-banner-content">
                  <h3>Ubicación no compartida</h3>
                  <p>
                    Has decidido no compartir tu ubicación. Actívala para poder calcular las distancias y mostrarte las ofertas más cercanas a ti.
                  </p>
                </div>
                <button onClick={solicitarGeolocalizacion} className="btn-primary retry-geo-btn">
                  Permitir ubicación y buscar
                </button>
              </div>
            )}

            {/* Caso C: El usuario bloqueó la ubicación en la ventanita del navegador (Rechazo permanente nativo) */}
            {estadoPermisoNativo === 'denied' && (
              <div className="fallback-banner" style={{ border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                <svg
                  viewBox="0 0 24 24"
                  width="36"
                  height="36"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="fallback-banner-icon"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div className="fallback-banner-content">
                  <h3>Ubicación bloqueada</h3>
                  <p>
                    Has bloqueado el acceso a la ubicación en tu navegador.
                    Para ver ofertas cercanas, haz clic en el icono del candado en la barra de direcciones de tu navegador y activa el permiso de <strong>Ubicación</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Cargando coordenadas del navegador si ya se tiene el permiso */}
            {estadoPermisoNativo === 'granted' && !coordenadas && (
              <div className="loading-geo-container" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <LoadingSkeleton cantidad={3} />
                <p style={{ color: '#6b6375', marginTop: '1.5rem', fontWeight: '500' }}>
                  Obteniendo coordenadas de ubicación precisas...
                </p>
              </div>
            )}

            {error && (
              <div className="error-banner">
                <p>{error}</p>
                <button onClick={solicitarGeolocalizacion} className="btn-secondary error-retry-btn">
                  Reintentar
                </button>
              </div>
            )}

            {/* Carga Inicial del Feed */}
            {cargando && coordenadas && <LoadingSkeleton cantidad={6} />}

            {/* Listado de Ofertas */}
            {!cargando && permisoGeo === 'granted' && productos.length > 0 && (
              <div className="explore-products-grid">
                {productos.map((producto) => (
                  <ProductFeedCard key={producto.id} producto={producto} />
                ))}
              </div>
            )}

            {/* Sin Ofertas */}
            {!cargando && permisoGeo === 'granted' && productos.length === 0 && !error && (
              <div className="empty-state">
                <p>No se encontraron ofertas disponibles dentro del radio configurado.</p>
              </div>
            )}

            {/* Scroll Infinito Sentinel */}
            {permisoGeo === 'granted' && (
              <div ref={sentinelRef} className="infinite-scroll-sentinel">
                {cargandoMas && <LoadingSkeleton cantidad={3} />}
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  )
}
