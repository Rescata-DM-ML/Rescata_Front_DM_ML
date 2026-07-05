import { useEffect, useState } from 'react'
import { useAuthStore } from '../features/auth/stores/auth.store'
import api from '../core/interceptors/axios.interceptor'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'

export default function NegocioPedidos() {
  const { user } = useAuthStore()
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const obtenerPedidos = async () => {
      if (!user?.negocio?.id) {
        setCargando(false)
        return
      }
      try {
        const resReservas = await api.get(`/reservas/negocio`)
        const rData = Array.isArray(resReservas.data.data)
          ? resReservas.data.data
          : Array.isArray(resReservas.data)
            ? resReservas.data
            : []
        setReservas(rData)
      } catch (err) {
        console.error('Error al cargar pedidos del negocio:', err)
      } finally {
        setCargando(false)
      }
    }
    obtenerPedidos()
  }, [user])

  const handleConfirmarEntrega = async (reservaId) => {
    try {
      await api.patch(`/reservas/${reservaId}/confirmar`)
      setReservas((prev) =>
        prev.map((r) => (r.id === reservaId ? { ...r, estado: 'confirmado' } : r))
      )
    } catch (err) {
      console.error('Error al confirmar entrega:', err)
      alert('No se pudo confirmar la entrega. Intenta nuevamente.')
    }
  }

  return (
    <main
      className="dashboard-section-container"
      style={{
        flexGrow: 1,
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '3rem 2rem 4rem',
        boxSizing: 'border-box',
      }}
    >
      <h2
        className="explore-section-title"
        style={{
          fontSize: '1.75rem',
          fontWeight: '800',
          color: '#0c0a0f',
          marginBottom: '2rem',
          letterSpacing: '-0.02em',
        }}
      >
        Pedidos por Entregar
      </h2>

      <div className="dashboard-content-section" style={{ width: '100%' }}>
        {cargando ? (
          <LoadingSkeleton cantidad={3} />
        ) : reservas.length > 0 ? (
          <div className="dashboard-orders-flow">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {reservas.map((reserva) => (
                <div
                  key={reserva.id}
                  style={{
                    background: '#fff',
                    border: '1px solid rgba(229,228,231,0.7)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '9999px',
                        background:
                          reserva.estado === 'pendiente'
                            ? 'rgba(234, 179, 8, 0.15)'
                            : 'rgba(22, 163, 74, 0.15)',
                        color: reserva.estado === 'pendiente' ? '#a16207' : '#16a34a',
                      }}
                    >
                      {reserva.estado.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#8c8297' }}>
                      {new Date(reserva.creadaEn).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div>
                    <h4
                      style={{
                        margin: '0 0 0.25rem 0',
                        fontSize: '1.1rem',
                        color: '#0c0a0f',
                        fontWeight: '700',
                      }}
                    >
                      {reserva.producto?.nombre || 'Producto'}
                    </h4>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#6b6375' }}>
                      <strong>Consumidor:</strong> {reserva.consumidor?.nombre || 'No disponible'}
                    </p>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#6b6375' }}>
                      <strong>Cantidad:</strong> {reserva.cantidad} unidad(es)
                    </p>
                  </div>

                  {reserva.estado === 'pendiente' ? (
                    <button
                      onClick={() => handleConfirmarEntrega(reserva.id)}
                      className="btn-primary"
                      style={{ marginTop: 'auto', padding: '0.75rem', fontSize: '0.95rem' }}
                    >
                      Entregar Pedido
                    </button>
                  ) : (
                    <button
                      className="btn-secondary"
                      disabled
                      style={{ marginTop: 'auto', padding: '0.75rem', fontSize: '0.95rem' }}
                    >
                      Ya entregado
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#fcfcfd',
              border: '2px dashed rgba(229, 228, 231, 1)',
              borderRadius: '20px',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            <h4
              style={{
                margin: '0 0 0.5rem 0',
                color: '#0c0a0f',
                fontSize: '1.1rem',
                fontWeight: '700',
              }}
            >
              No tienes pedidos
            </h4>
            <p
              style={{
                margin: '0',
                color: '#6b6375',
                fontSize: '0.9rem',
                lineHeight: '1.5',
              }}
            >
              Aún no hay apartados pendientes para tus productos.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
