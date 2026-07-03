import { useAuthStore } from '../features/auth/stores/auth.store'
import api from '../core/interceptors/axios.interceptor'
import '../App.css'

export default function NegocioDashboard() {
  const { user, clearUser } = useAuthStore()

  const handleLogout = async () => {
    try {
      // Intentar llamar a logout del backend para borrar la cookie HttpOnly
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Error logging out from backend:', err)
    } finally {
      // Limpiar el estado local de Zustand en cualquier caso
      clearUser()
    }
  }

  return (
    <div className="home-container">
      <div className="home-card" style={{ maxWidth: '640px' }}>
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
          <h1 className="welcome-title">¡Bienvenido, {user?.nombre || 'Comerciante'}!</h1>
          <p className="welcome-subtitle">
            El perfil de tu negocio está activo. Ya puedes gestionar tus ofertas y comenzar a
            rescatar comida.
          </p>

          {/* Business Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                background: '#f9fafb',
                border: '1px solid rgba(229, 228, 231, 0.8)',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#6b6375',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  marginBottom: '0.25rem',
                }}
              >
                Productos
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16A34A' }}>0</div>
            </div>
            <div
              style={{
                background: '#f9fafb',
                border: '1px solid rgba(229, 228, 231, 0.8)',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#6b6375',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  marginBottom: '0.25rem',
                }}
              >
                Ventas
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16A34A' }}>$0.00</div>
            </div>
            <div
              style={{
                background: '#f9fafb',
                border: '1px solid rgba(229, 228, 231, 0.8)',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#6b6375',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  marginBottom: '0.25rem',
                }}
              >
                Rescatados
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16A34A' }}>0 kg</div>
            </div>
          </div>

          <div className="profile-details-card">
            <h3>Datos de tu Cuenta de Negocio</h3>
            <div className="detail-item">
              <span className="detail-label">Nombre del Propietario:</span>
              <span className="detail-value">{user?.nombre || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Correo de Contacto:</span>
              <span className="detail-value">{user?.correo || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Rol de Acceso:</span>
              <span
                className="detail-value badge"
                style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16A34A' }}
              >
                {user?.rol || 'negocio'}
              </span>
            </div>
          </div>

          {/* Quick Action */}
          <div
            style={{
              background:
                'linear-gradient(135deg, rgba(22, 163, 74, 0.05) 0%, rgba(22, 163, 74, 0.02) 100%)',
              border: '1.5px dashed rgba(22, 163, 74, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            <h4
              style={{
                margin: '0 0 0.5rem 0',
                color: '#0c0a0f',
                fontSize: '1rem',
                fontWeight: '600',
              }}
            >
              Publica tu primer producto
            </h4>
            <p
              style={{
                margin: '0 0 1rem 0',
                color: '#6b6375',
                fontSize: '0.875rem',
                lineHeight: '1.4',
              }}
            >
              Sube tus excedentes de comida a la plataforma para que los consumidores cercanos
              puedan verlos y apartarlos.
            </p>
            <button
              onClick={() => alert('Próximamente: Panel de gestión de productos')}
              className="btn-primary"
              style={{
                maxWidth: '240px',
                margin: '0 auto',
                fontSize: '0.9rem',
                padding: '0.6rem 1rem',
              }}
            >
              + Agregar Oferta
            </button>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}
