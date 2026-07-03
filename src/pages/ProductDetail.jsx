import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../core/interceptors/axios.interceptor'
import { useAuthStore } from '../features/auth/stores/auth.store'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'
import './ProductDetail.css'

function formatearFechaVencimiento(fechaStr) {
  if (!fechaStr) return ''
  const fecha = new Date(fechaStr)
  const ahora = new Date()

  // Comprobar si es hoy
  const esHoy = 
    fecha.getDate() === ahora.getDate() &&
    fecha.getMonth() === ahora.getMonth() &&
    fecha.getFullYear() === ahora.getFullYear()

  // Comprobar si es mañana
  const manana = new Date(ahora)
  manana.setDate(ahora.getDate() + 1)
  const esManana = 
    fecha.getDate() === manana.getDate() &&
    fecha.getMonth() === manana.getMonth() &&
    fecha.getFullYear() === manana.getFullYear()

  const horas = String(fecha.getHours()).padStart(2, '0')
  const minutos = String(fecha.getMinutes()).padStart(2, '0')

  if (esHoy) {
    return `Vence hoy a las ${horas}:${minutos}`
  }
  if (esManana) {
    return `Vence mañana a las ${horas}:${minutos}`
  }

  const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' }
  const fechaFormateada = fecha.toLocaleDateString('es-MX', opciones)
  return `Vence el ${fechaFormateada} a las ${horas}:${minutos}`
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [fotoActiva, setFotoActiva] = useState(0)

  useEffect(() => {
    const obtenerDetalle = async () => {
      setCargando(true)
      setError(null)
      try {
        const response = await api.get(`/productos/${id}`)
        setProducto(response.data)
      } catch (err) {
        console.error('Error al obtener detalle del producto:', err)
        setError('No pudimos cargar la información del producto. Puede que no exista o no tengas permisos.')
      } finally {
        setCargando(false)
      }
    }
    obtenerDetalle()
  }, [id])

  if (cargando) {
    return (
      <div className="product-detail-container loading-container">
        <LoadingSkeleton cantidad={3} />
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="product-detail-container error-container">
        <div className="fallback-banner" style={{ border: '1px solid rgba(220, 38, 38, 0.2)' }}>
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="fallback-banner-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div className="fallback-banner-content">
            <h3>Error al cargar</h3>
            <p>{error || 'Producto no encontrado.'}</p>
          </div>
          <button onClick={() => navigate('/explore')} className="btn-primary">
            Volver a explorar
          </button>
        </div>
      </div>
    )
  }

  const {
    nombre,
    descripcion,
    precioOriginal,
    precioOferta,
    cantidadDisponible,
    fechaCaducidad,
    estado,
    negocio,
    imagenes,
    fotoUrl,
  } = producto

  const isConsumidor = user?.rol === 'consumidor' || user?.role === 'consumidor'
  const isNegocio = user?.rol === 'negocio' || user?.role === 'negocio'

  // Crear la lista de imágenes para el carrusel (máximo 3)
  const fallbackImage = 'https://placehold.co/600x400/16a34a/ffffff?text=RESCATA'
  const listaFotos = imagenes && imagenes.length > 0 
    ? imagenes.map(img => img.url).slice(0, 3) 
    : [fotoUrl || fallbackImage]

  const irSiguienteFoto = () => {
    setFotoActiva((prev) => (prev + 1) % listaFotos.length)
  }

  const irAnteriorFoto = () => {
    setFotoActiva((prev) => (prev - 1 + listaFotos.length) % listaFotos.length)
  }

  const esDisponible = estado === 'disponible' && cantidadDisponible > 0

  const handleApartarClick = () => {
    alert('¡Próximamente!\n\nEn la siguiente rama (RF-FE-08) implementaremos la confirmación atómica del apartado, el límite de 2 horas para recolectar y el temporizador en tiempo real.')
  }

  return (
    <main className="product-detail-container">
      <div className="product-detail-header-row">
        <button onClick={() => navigate(-1)} className="btn-back">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Atrás</span>
        </button>
      </div>

      <div className="product-detail-grid">
        {/* Lado Izquierdo: Galería de Fotos */}
        <section className="product-detail-gallery">
          <div className="carousel-wrapper">
            <img 
              src={listaFotos[fotoActiva]} 
              alt={nombre} 
              className="carousel-main-image" 
            />
            {listaFotos.length > 1 && (
              <>
                <button onClick={irAnteriorFoto} className="carousel-control prev" aria-label="Foto anterior">
                  &#10094;
                </button>
                <button onClick={irSiguienteFoto} className="carousel-control next" aria-label="Siguiente foto">
                  &#10095;
                </button>
                <div className="carousel-indicators">
                  {listaFotos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFotoActiva(idx)}
                      className={`carousel-dot ${fotoActiva === idx ? 'active' : ''}`}
                      aria-label={`Ir a foto ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Lado Derecho: Información Completa y Compra */}
        <section className="product-detail-info">
          <div className="product-detail-card-main">
            <span className="product-detail-badge-caducidad">
              {formatearFechaVencimiento(fechaCaducidad)}
            </span>
            <h1 className="product-detail-title">{nombre}</h1>
            <p className="product-detail-description">
              {descripcion || 'Sin descripción disponible.'}
            </p>

            <div className="product-detail-pricing">
              <div className="price-tag offer-price">
                <span className="price-label">Precio Oferta</span>
                <span className="price-value">${precioOferta.toFixed(2)}</span>
              </div>
              <div className="price-tag original-price">
                <span className="price-label">Precio Original</span>
                <span className="price-value-crossed">
                  {precioOriginal !== undefined && precioOriginal !== null 
                    ? `$${precioOriginal.toFixed(2)}` 
                    : 'N/A'}
                </span>
              </div>
            </div>

            <div className="product-detail-stock">
              <span className="stock-label">Disponibles para rescatar:</span>
              <span className={`stock-value ${cantidadDisponible <= 2 ? 'low-stock' : ''}`}>
                {cantidadDisponible} unidades
              </span>
            </div>

            {/* Botón de Acción Principal */}
            <div className="product-detail-action-container">
              {isConsumidor && (
                <button
                  onClick={handleApartarClick}
                  disabled={!esDisponible}
                  className={`btn-primary btn-apartar ${!esDisponible ? 'disabled' : ''}`}
                >
                  {esDisponible ? 'Apartar Oferta' : 'No disponible'}
                </button>
              )}

              {isNegocio && (
                <button
                  disabled
                  className="btn-secondary btn-editar disabled"
                  title="Funcionalidad de edición disponible próximamente"
                >
                  Editar Producto
                </button>
              )}
            </div>
          </div>

          {/* Tarjeta del Negocio */}
          {negocio && (
            <div className="product-detail-business-card">
              <div className="business-card-header">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <div>
                  <h3 className="business-title">{negocio.nombre}</h3>
                  <div className="business-rating">
                    ★ {negocio.calificacionPromedio ? negocio.calificacionPromedio.toFixed(1) : '5.0'}
                  </div>
                </div>
              </div>
              <div className="business-details">
                <div className="business-address">
                  <strong>Dirección: </strong>
                  <span>{negocio.direccion || 'No especificada'}</span>
                </div>
                {negocio.id && (
                  <Link to={`/negocio/${negocio.id}`} className="btn-secondary business-catalog-link">
                    Ver catálogo de este negocio
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
