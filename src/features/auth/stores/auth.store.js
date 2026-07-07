// AUDIT: Cumple con OWASP-FE-02 (Almacenamiento seguro: prohibición de JWT en localStorage)
// - El estado de Zustand almacena solo datos no sensibles del perfil de usuario: id, nombre, correo y rol.
// - El token JWT nunca se almacena en el estado local ni en localStorage/sessionStorage.
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null, // { id, nombre, correo, rol }
  isAuth: false,
  setUser: (user) => set({ user, isAuth: !!user }),
  clearUser: () => set({ user: null, isAuth: false }),
}))
