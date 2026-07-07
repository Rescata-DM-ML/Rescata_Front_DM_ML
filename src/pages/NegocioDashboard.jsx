import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../features/auth/stores/auth.store'
import api from '../core/interceptors/axios.interceptor'
import ProductFeedCard from '../components/shared/ProductFeedCard'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'

export default function NegocioDashboard() {
  const { user } = useAuthStore()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const obtenerProductos = async () => {
      if (!user?.negocio?.id) {
        setCargando(false)
        return
      }
      try {
        const response = await api.get(`/productos?negocioId=${user.negocio.id}`)
        setProductos(response.data || [])
      } catch (err) {
        console.error('Error al obtener los productos del negocio:', err)
      } finally {
        setCargando(false)
      }
    }
    obtenerProductos()
  }, [user])

  const nombreNegocio = user?.negocio?.nombre || 'tu negocio'

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h2
          className="explore-section-title"
          style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            color: '#0c0a0f',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Mi Dashboard
        </h2>
      </div>

      <div
        className="dashboard-welcome-card"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(229, 228, 231, 0.7)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
          boxSizing: 'border-box',
          marginBottom: '2.5rem',
        }}
      >
        <h1
          className="welcome-title"
          style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            color: '#0c0a0f',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.02em',
          }}
        >
          ¡Bienvenido, {user?.nombre || 'Comerciante'}!
        </h1>
        <p
          className="welcome-subtitle"
          style={{ fontSize: '0.95rem', color: '#6b6375', margin: '0 0 2rem 0' }}
        >
          El perfil de <strong>{nombreNegocio}</strong> está activo. Ya puedes gestionar tus ofertas
          y comenzar a rescatar comida.
        </p>

        {/* Business Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              background: '#fcfcfd',
              border: '1px solid rgba(229, 228, 231, 0.5)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: '#6b6375',
                fontWeight: '600',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
                letterSpacing: '0.05em',
              }}
            >
              Productos
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#16A34A' }}>
              {cargando ? '...' : productos.length}
            </div>
          </div>
          <div
            style={{
              background: '#fcfcfd',
              border: '1px solid rgba(229, 228, 231, 0.5)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: '#6b6375',
                fontWeight: '600',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
                letterSpacing: '0.05em',
              }}
            >
              Ventas
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#16A34A' }}>$0.00</div>
          </div>
          <div
            style={{
              background: '#fcfcfd',
              border: '1px solid rgba(229, 228, 231, 0.5)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: '#6b6375',
                fontWeight: '600',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
                letterSpacing: '0.05em',
              }}
            >
              Rescatados
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#16A34A' }}>0 kg</div>
          </div>
        </div>
      </div>

      {/* Sección inferior: Productos del Negocio u Oferta Inicial */}
      <div className="dashboard-content-section" style={{ width: '100%' }}>
        {cargando ? (
          <LoadingSkeleton cantidad={3} />
        ) : productos.length > 0 ? (
          <div className="dashboard-products-active-flow">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0c0a0f' }}>
                Mis Productos Publicados
              </h3>
              <Link
                to="/negocio/publicar"
                className="btn-primary"
                style={{
                  fontSize: '0.9rem',
                  padding: '0.5rem 1.25rem',
                  width: 'auto',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                + Agregar Oferta
              </Link>
            </div>

            <div className="explore-products-grid">
              {productos.map((producto) => (
                <ProductFeedCard
                  key={producto.id}
                  producto={{
                    ...producto,
                    distanciaKm: 0, // Como es su propio negocio, no aplica distancia física
                    negocio: {
                      nombre: user?.negocio?.nombre || 'Mi Negocio',
                      calificacionPromedio: user?.negocio?.calificacionPromedio || 5.0,
                    },
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Sin productos: Mostrar Quick Action original */
          <div
            style={{
              background:
                'linear-gradient(135deg, rgba(22, 163, 74, 0.04) 0%, rgba(22, 163, 74, 0.01) 100%)',
              border: '2px dashed rgba(22, 163, 74, 0.2)',
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
              Publica tu primer producto
            </h4>
            <p
              style={{
                margin: '0 0 1.5rem 0',
                color: '#6b6375',
                fontSize: '0.9rem',
                lineHeight: '1.5',
              }}
            >
              Sube tus excedentes de comida a la plataforma para que los consumidores cercanos
              puedan verlos y apartarlos.
            </p>
            <Link
              to="/negocio/publicar"
              className="btn-primary"
              style={{
                maxWidth: '240px',
                margin: '0 auto',
                fontSize: '0.95rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'block',
                textAlign: 'center',
              }}
            >
              + Agregar Oferta
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
