import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import AuthGuard from './core/guards/AuthGuard';
import { useAuthStore } from './features/auth/stores/auth.store';
import './App.css';

function RootRedirect() {
  const isAuth = useAuthStore((state) => state.isAuth);
  return <Navigate to={isAuth ? '/explore' : '/login'} replace />;
}

function Explore() {
  const { user, clearUser } = useAuthStore();

  return (
    <div className="home-container">
      <div className="home-card">
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
          <h1 className="welcome-title">¡Bienvenido, {user?.nombre || 'Usuario'}!</h1>
          <p className="welcome-subtitle">Tu cuenta de consumidor está activa y has iniciado sesión.</p>
          
          <div className="profile-details-card">
            <h3>Datos de tu Sesión</h3>
            <div className="detail-item">
              <span className="detail-label">ID de Usuario:</span>
              <span className="detail-value mono-text">{user?.id || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Nombre:</span>
              <span className="detail-value">{user?.nombre || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Correo:</span>
              <span className="detail-value">{user?.correo || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Rol:</span>
              <span className="detail-value badge">{user?.rol || 'consumidor'}</span>
            </div>
          </div>

          <button onClick={clearUser} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas Protegidas */}
        <Route element={<AuthGuard />}>
          <Route path="/explore" element={<Explore />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
