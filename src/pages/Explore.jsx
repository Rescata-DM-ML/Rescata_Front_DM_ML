import { useRef, useEffect } from 'react'
import useGetProductosCercanos from '../features/productos/hooks/useGetProductosCercanos'
import GeolocationBanner from '../components/shared/GeolocationBanner'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'
import ProductFeedCard from '../components/shared/ProductFeedCard'
import './Explore.css'

export default function Explore() {
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

  const sentinelRef = useRef(null)

  console.log('[DEBUG] Explore Render - permisoGeo:', permisoGeo, 'estadoPermisoNativo:', estadoPermisoNativo, 'coords:', coordenadas, 'productos:', productos.length)

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
  )
}
