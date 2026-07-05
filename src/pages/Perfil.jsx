import { useAuthStore } from '../features/auth/stores/auth.store'
import './Perfil.css'

export default function Perfil() {
  const { user } = useAuthStore()

  const isNegocio = user?.rol === 'negocio' || user?.role === 'negocio'

  // Determinar la inicial para el avatar
  const inicial = user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'

  // Mapear categorías del negocio a nombres amigables
  const obtenerNombreCategoria = (cat) => {
    const categorias = {
      fruteria: 'Frutería',
      panaderia: 'Panadería',
      cafeteria: 'Cafetería',
      restaurante: 'Restaurante',
      supermercado: 'Supermercado',
      tienda: 'Tienda / Abarrotes',
    }
    return categorias[cat] || cat || 'No especificada'
  }

  return (
    <main className="profile-section-container">
      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-avatar-placeholder">{inicial}</div>
          <h1 className="welcome-title">¡Bienvenido, {user?.nombre || 'Usuario'}!</h1>
          <p className="welcome-subtitle">
            Tu cuenta de {isNegocio ? 'negocio' : 'consumidor'} está activa y has iniciado sesión.
          </p>
        </div>

        {/* Sección de Datos Personales / Propietario */}
        <div className="profile-details-card">
          <h3>Datos de tu Cuenta</h3>
          <div className="detail-item">
            <span className="detail-label">ID de Usuario:</span>
            <span className="detail-value mono-text">{user?.id || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Nombre Completo:</span>
            <span className="detail-value">{user?.nombre || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Correo Electrónico:</span>
            <span className="detail-value">{user?.correo || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Rol de Acceso:</span>
            <span className="detail-value badge">{isNegocio ? 'Negocio' : 'Consumidor'}</span>
          </div>
        </div>

        {/* Sección de Datos del Establecimiento (Solo para Negocios) */}
        {isNegocio && (
          <div className="profile-details-card business-card-details">
            <h3>Datos del Establecimiento</h3>
            <div className="detail-item">
              <span className="detail-label">Nombre del Negocio:</span>
              <span className="detail-value">{user?.negocio?.nombre || 'No especificado'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Dirección comercial:</span>
              <span className="detail-value">{user?.negocio?.direccion || 'No especificada'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Categoría:</span>
              <span className="detail-value badge category-badge">
                {obtenerNombreCategoria(user?.negocio?.categoria)}
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
