import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../core/interceptors/axios.interceptor'
import ProductFeedCard from '../components/shared/ProductFeedCard'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'
import './BusinessCatalog.css'

export default function BusinessCatalog() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [negocio, setNegocio] = useState(null)
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const obtenerCatalogo = async () => {
      setCargando(true)
      setError(null)
      try {
        // 1. Obtener la información del negocio
        const resNegocio = await api.get(`/negocios/${id}`)
        setNegocio(resNegocio.data)

        // 2. Obtener los productos asociados a este negocio
        const resProductos = await api.get(`/productos?negocioId=${id}`)
        setProductos(resProductos.data || [])
      } catch (err) {
        console.error('Error al obtener catálogo del negocio:', err)
        setError('No pudimos cargar la información del negocio o sus ofertas.')
      } finally {
        setCargando(false)
      }
    }
    obtenerCatalogo()
  }, [id])

  if (cargando) {
    return (
      <div className="business-catalog-container loading-container">
        <LoadingSkeleton cantidad={6} />
      </div>
    )
  }

  if (error || !negocio) {
    return (
      <div className="business-catalog-container error-container">
        <div className="fallback-banner" style={{ border: '1px solid rgba(220, 38, 38, 0.2)' }}>
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="fallback-banner-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div className="fallback-banner-content">
            <h3>Error al cargar</h3>
            <p>{error || 'Negocio no encontrado.'}</p>
          </div>
          <button onClick={() => navigate('/explore')} className="btn-primary">
            Volver a explorar
          </button>
        </div>
      </div>
    )
  }

  const { nombre, calificacionPromedio, direccion, categoria } = negocio

  // Mapear categorías del negocio a nombres amigables
  const obtenerNombreCategoria = (cat) => {
    const categorias = {
      fruteria: 'Frutería',
      panaderia: 'Panadería',
      cafeteria: 'Cafetería',
      restaurante: 'Restaurante',
      supermercado: 'Supermercado',
      tienda: 'Tienda / Abarrotes'
    }
    return categorias[cat] || cat || 'Establecimiento'
  }

  return (
    <main className="business-catalog-container">
      {/* Botón de Atrás */}
      <div className="business-catalog-header-row">
        <button onClick={() => navigate(-1)} className="btn-back">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Atrás</span>
        </button>
      </div>

      {/* Tarjeta de Información Superior del Negocio */}
      <section className="business-catalog-info-card">
        <div className="business-catalog-brand">
          <div className="business-catalog-avatar">
            {nombre.charAt(0).toUpperCase()}
          </div>
          <div className="business-catalog-title-section">
            <span className="business-catalog-category-badge">
              {obtenerNombreCategoria(categoria)}
            </span>
            <h1 className="business-catalog-name">{nombre}</h1>
            <div className="business-catalog-rating">
              ★ {calificacionPromedio ? calificacionPromedio.toFixed(1) : '5.0'}
            </div>
          </div>
        </div>
        <div className="business-catalog-details">
          <div className="detail-row">
            <strong style={{ color: '#8c8297' }}>Dirección:</strong>
            <span style={{ color: '#0c0a0f', fontWeight: '500' }}>{direccion}</span>
          </div>
        </div>
      </section>

      {/* Listado de Ofertas del Negocio */}
      <section className="business-catalog-offers-section">
        <h2 className="catalog-section-title">Ofertas de este establecimiento</h2>
        
        {productos.length === 0 ? (
          <div className="empty-state">
            <p>Este establecimiento no tiene ofertas publicadas en este momento.</p>
          </div>
        ) : (
          <div className="explore-products-grid">
            {productos.map((producto) => (
              // Asegurar que el componente de la tarjeta reciba las coordenadas simuladas 
              // para evitar errores al renderizar distanciaKm si no las calcula
              <ProductFeedCard 
                key={producto.id} 
                producto={{
                  ...producto,
                  // Si no trae distanciaKm de la respuesta, asignarle 0
                  distanciaKm: producto.distanciaKm !== undefined ? producto.distanciaKm : 0,
                  negocio: {
                    nombre: nombre,
                    calificacionPromedio: calificacionPromedio
                  }
                }} 
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
