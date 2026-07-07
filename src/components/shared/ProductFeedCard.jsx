import { Link } from 'react-router-dom'
import './ProductFeedCard.css'

function formatearTiempoCaducidad(fechaCaducidadStr) {
  if (!fechaCaducidadStr) return ''
  const ahora = new Date()
  const caducidad = new Date(fechaCaducidadStr)
  const diffMs = caducidad.getTime() - ahora.getTime()

  if (diffMs <= 0) {
    return 'Caducado'
  }

  const diffMin = Math.floor(diffMs / (1000 * 60))
  if (diffMin < 60) {
    return `Caduca en ${diffMin} min`
  }

  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHrs < 24) {
    return `Caduca en ${diffHrs} h`
  }

  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays === 1) {
    return 'Caduca mañana'
  }

  return `Caduca en ${diffDays} días`
}

export default function ProductFeedCard(props) {
  // Support both passing single destructured props and wrapping under the 'producto' prop
  const producto = props.producto || props
  const {
    id,
    nombre,
    descripcion,
    precioOriginal,
    precioOferta,
    cantidadDisponible,
    fechaCaducidad,
    fotoUrl,
    negocio,
    distanciaKm = 0,
  } = producto

  const fallbackImage = 'https://placehold.co/600x400/16a34a/ffffff?text=RESCATA'
  let imgUrl = fotoUrl || fallbackImage
  if (imgUrl && imgUrl.includes('pub-mock.r2.dev') && nombre) {
    imgUrl = `https://placehold.co/600x400/16a34a/ffffff?text=${encodeURIComponent(nombre)}`
  }

  const tiempoCaducidad = formatearTiempoCaducidad(fechaCaducidad)

  const formattedDate = fechaCaducidad
    ? new Date(fechaCaducidad).toLocaleDateString(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : ''

  const descripcionTruncada =
    descripcion && descripcion.length > 100
      ? descripcion.substring(0, 100) + '...'
      : descripcion || ''

  return (
    <Link
      to={`/productos/${id || producto.id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div className="product-feed-card">
        <div className="product-card-image-container">
          <img src={imgUrl} alt={nombre} className="product-card-image" />
          {tiempoCaducidad && (
            <span className="product-card-badge-caducidad">{tiempoCaducidad}</span>
          )}
        </div>

        <div className="product-card-content">
          <div className="product-card-business-row">
            <span className="product-card-business-name">{negocio?.nombre || 'Negocio'}</span>
            {negocio?.calificacionPromedio !== undefined && (
              <span className="detail-value badge product-card-rating">
                ★ {Number(negocio.calificacionPromedio).toFixed(1)}
              </span>
            )}
          </div>

          <p className="product-card-title">{nombre}</p>
          <p className="product-card-description">{descripcionTruncada}</p>

          <div className="product-card-info-row">
            {cantidadDisponible !== undefined && cantidadDisponible !== null && (
              <span className="product-card-stock">Disponibles: {cantidadDisponible}</span>
            )}
            {formattedDate && <span className="product-card-expiry">Vence: {formattedDate}</span>}
          </div>

          <div className="product-card-pricing-row">
            <div className="product-card-prices">
              <span className="product-card-price-offer">
                $
                {precioOferta !== undefined && precioOferta !== null
                  ? Number(precioOferta).toFixed(2)
                  : '0.00'}
              </span>
              <span className="product-card-price-original">
                {precioOriginal !== undefined && precioOriginal !== null
                  ? `$${Number(precioOriginal).toFixed(2)}`
                  : 'N/A'}
              </span>
            </div>

            {distanciaKm !== undefined && (
              <div className="product-card-distance">
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="#6b6375"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="product-card-distance-icon"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{Number(distanciaKm).toFixed(1)} km</span>
              </div>
            )}
          </div>

          <div
            className="product-card-action-row"
            style={{
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px dashed rgba(229, 228, 231, 0.5)',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              fontSize: '0.825rem',
              fontWeight: '700',
              color: '#16a34a',
              gap: '0.25rem',
            }}
          >
            <span>Ver detalle</span>
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
