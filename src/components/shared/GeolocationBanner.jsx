import { Link } from 'react-router-dom'
import './GeolocationBanner.css'

export default function GeolocationBanner({ onAceptar, onRechazar }) {
  return (
    <div className="geolocation-banner-container">
      <div className="geolocation-banner-icon">
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
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <h2 className="geolocation-banner-title">Para mostrarte ofertas cercanas</h2>
      <p className="geolocation-banner-text">
        Necesitamos tu ubicación para calcular distancias. Tus coordenadas se usan solo para esto y
        no se almacenan permanentemente.
      </p>
      <Link to="/aviso-privacidad" className="geolocation-banner-link">
        Ver Aviso de Privacidad
      </Link>
      <div className="geolocation-banner-buttons">
        <button onClick={onAceptar} className="btn-primary">
          Permitir ubicación
        </button>
        <button onClick={onRechazar} className="btn-secondary">
          Ahora no
        </button>
      </div>
    </div>
  )
}
