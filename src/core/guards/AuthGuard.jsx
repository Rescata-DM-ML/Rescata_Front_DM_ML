import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/stores/auth.store'

export default function AuthGuard() {
  const isAuth = useAuthStore((state) => state.isAuth)

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />
}
