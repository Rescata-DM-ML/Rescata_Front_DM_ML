import { useRef, useEffect } from 'react'
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
    solicitarGeolocalizacion,
    denegarPermisoManual,
    cargarMas,
  } = useGetProductosCercanos()

  const sentinelRef = useRef(null)

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

  return (
    <div className="explore-page-container">
      <header className="explore-header">
        <div className="explore-header-card">
          <div className="logo-container centered">
            <svg
              viewBox="0 0 24 24"
              width="48"
              height="48"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="brand-name font-large">RESCATA</span>
          </div>

          <div className="auth-profile-section">
            <h1 className="welcome-title">¡Bienvenido, {user?.nombre || 'Usuario'}!</h1>
            <p className="welcome-subtitle">
              Tu cuenta de consumidor está activa y has iniciado sesión.
            </p>

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

            <button onClick={clearUser} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="explore-feed-section">
        <h2 className="explore-section-title">Ofertas Cercanas Rescatables</h2>

        {permisoGeo === 'pending' && (
          <GeolocationBanner
            onAceptar={solicitarGeolocalizacion}
            onRechazar={denegarPermisoManual}
          />
        )}

        {permisoGeo === 'denied' && (
          <div className="fallback-banner">
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
              <h3>Ubicación no disponible</h3>
              <p>
                No pudimos acceder a tu ubicación. Activa los permisos de ubicación para ver ofertas
                cercanas.
              </p>
              {/* 
                TODO: El backend actual requiere lat/lng obligatorios para el feed.
                Cuando se implemente un endpoint fallback para ordenar por fecha sin geolocalización,
                deberá consumirse aquí cuando permisoGeo sea 'denied'.
              */}
            </div>
            <button onClick={solicitarGeolocalizacion} className="btn-primary retry-geo-btn">
              Reintentar ubicación
            </button>
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

        {/* Carga Inicial */}
        {cargando && <LoadingSkeleton cantidad={6} />}

        {/* Listado de Ofertas */}
        {!cargando && productos.length > 0 && (
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
        <div ref={sentinelRef} className="infinite-scroll-sentinel">
          {cargandoMas && <LoadingSkeleton cantidad={3} />}
        </div>
      </main>
    </div>
  )
}
