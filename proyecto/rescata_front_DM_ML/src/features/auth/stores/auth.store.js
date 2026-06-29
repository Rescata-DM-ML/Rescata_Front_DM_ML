import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null, // { id, nombre, correo, rol }
  isAuth: false,
  setUser: (user) => set({ user, isAuth: !!user }),
  clearUser: () => set({ user: null, isAuth: false }),
}));
