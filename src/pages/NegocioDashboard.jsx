import { useAuthStore } from '../features/auth/stores/auth.store'

export default function NegocioDashboard() {
  const { user } = useAuthStore()

  return (
    <main className="dashboard-section-container" style={{ flexGrow: 1, width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem 4rem', boxSizing: 'border-box' }}>
      <h2 className="explore-section-title" style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0c0a0f', marginBottom: '2rem', letterSpacing: '-0.02em' }}>
        Mi Dashboard
      </h2>

      <div className="dashboard-welcome-card" style={{ background: '#ffffff', border: '1px solid rgba(229, 228, 231, 0.7)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', boxSizing: 'border-box' }}>
        <h1 className="welcome-title" style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0c0a0f', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
          ¡Bienvenido, {user?.nombre || 'Comerciante'}!
        </h1>
        <p className="welcome-subtitle" style={{ fontSize: '0.95rem', color: '#6b6375', margin: '0 0 2rem 0' }}>
          El perfil de tu negocio está activo. Ya puedes gestionar tus ofertas y comenzar a rescatar comida.
        </p>

        {/* Business Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
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
            <div style={{ fontSize: '0.8rem', color: '#6b6375', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
              Productos
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#16A34A' }}>0</div>
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
            <div style={{ fontSize: '0.8rem', color: '#6b6375', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
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
            <div style={{ fontSize: '0.8rem', color: '#6b6375', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
              Rescatados
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#16A34A' }}>0 kg</div>
          </div>
        </div>

        {/* Quick Action */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.04) 0%, rgba(22, 163, 74, 0.01) 100%)',
            border: '2px dashed rgba(22, 163, 74, 0.2)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0c0a0f', fontSize: '1.1rem', fontWeight: '700' }}>
            Publica tu primer producto
          </h4>
          <p style={{ margin: '0 0 1.5rem 0', color: '#6b6375', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Sube tus excedentes de comida a la plataforma para que los consumidores cercanos puedan verlos y apartarlos.
          </p>
          <button
            onClick={() => alert('Próximamente: Panel de gestión de productos')}
            className="btn-primary"
            style={{
              maxWidth: '240px',
              margin: '0 auto',
              fontSize: '0.95rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
            }}
          >
            + Agregar Oferta
          </button>
        </div>
      </div>
    </main>
  )
}
