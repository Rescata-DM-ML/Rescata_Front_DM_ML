/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../core/interceptors/axios.interceptor'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'
import './Reservas.css'

function Countdown({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const targetDate = new Date(expiresAt).getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference <= 0) {
        setTimeLeft('00:00:00')
        if (onExpire) onExpire()
        return
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  return <span className="countdown-timer">{timeLeft}</span>
}

export default function Reservas() {
  const navigate = useNavigate()
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const obtenerReservas = async () => {
    try {
      const response = await api.get('/reservas/mis-reservas')
      const dataArray = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : []
      const reservasFiltradas = dataArray
        .map((r) => {
          if (r.estado === 'pendiente' && new Date(r.expiresAt).getTime() < new Date().getTime()) {
            return { ...r, estado: 'expirado' }
          }
          return r
        })
        .filter((r) => r.estado !== 'cancelado')

      setReservas(reservasFiltradas)
    } catch (err) {
      console.error('Error al obtener reservas:', err)
      setError('No pudimos cargar tus apartados. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const reintentar = () => {
    setCargando(true)
    setError(null)
    obtenerReservas()
  }

  useEffect(() => {
    obtenerReservas()
  }, [])
  const handleExpire = (reservaId) => {
    setReservas((prev) => prev.map((r) => (r.id === reservaId ? { ...r, estado: 'expirado' } : r)))
  }

  if (cargando) {
    return (
      <div className="reservas-container loading-container">
        <LoadingSkeleton cantidad={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="reservas-container error-container">
        <div className="fallback-banner">
          <h3>Error al cargar</h3>
          <p>{error}</p>
          <button onClick={reintentar} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="reservas-container">
      <div className="reservas-header">
        <h1>Mis Apartados</h1>
        <p>
          Gestiona tus productos reservados y recuerda pasar por ellos antes de que el tiempo
          expire.
        </p>
      </div>

      {reservas.length === 0 ? (
        <div className="reservas-empty">
          <svg
            viewBox="0 0 24 24"
            width="48"
            height="48"
            fill="none"
            stroke="#6b6375"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h3>No tienes apartados activos</h3>
          <p>Explora los productos disponibles y rescata comida deliciosa.</p>
          <button onClick={() => navigate('/explore')} className="btn-primary">
            Explorar Ofertas
          </button>
        </div>
      ) : (
        <div className="reservas-grid">
          {reservas.map((reserva) => (
            <div key={reserva.id} className={`reserva-card ${reserva.estado}`}>
              <div className="reserva-card-header">
                <span className={`estado-badge ${reserva.estado}`}>
                  {reserva.estado.toUpperCase()}
                </span>
                <span className="reserva-date">
                  {new Date(reserva.creadaEn).toLocaleDateString()}
                </span>
              </div>

              <div className="reserva-card-body">
                <h3 className="reserva-product-name">{reserva.producto?.nombre || 'Producto'}</h3>
                <p className="reserva-business">
                  <strong>Negocio:</strong> {reserva.negocio?.nombre || 'N/A'}
                </p>
                <p className="reserva-qty">
                  <strong>Cantidad apartada:</strong> {reserva.cantidad}{' '}
                  {reserva.cantidad > 1 ? 'unidades' : 'unidad'}
                </p>
              </div>

              {reserva.estado === 'pendiente' && (
                <div className="reserva-timer-section">
                  <p className="timer-label">Tiempo restante para recolección:</p>
                  <Countdown
                    expiresAt={reserva.expiresAt}
                    onExpire={() => handleExpire(reserva.id)}
                  />
                  <p className="timer-help">
                    Pasa por él antes de que termine el tiempo en la dirección del negocio.
                  </p>
                </div>
              )}

              {reserva.estado === 'confirmado' && (
                <div className="reserva-actions">
                  <button className="btn-secondary btn-calificar" disabled>
                    Calificar (Próximamente)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
