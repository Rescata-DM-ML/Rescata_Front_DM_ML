import { useState } from 'react'
import api from '../../../core/interceptors/axios.interceptor'
import { useAuthStore } from '../stores/auth.store'

export default function useAuthMutation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const setUser = useAuthStore((state) => state.setUser)

  // Register mutation
  const mutate = async (formData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.post('/auth/register/consumer', {
        nombre: formData.nombre,
        correo: formData.correo,
        contrasena: formData.contrasena,
        confirmacionContrasena: formData.confirmacionContrasena,
        consentimientoPrivacidad: formData.consentimientoPrivacidad,
      })

      const data = response.data || {}
      const userData = {
        id: data.id || data.user?.id,
        nombre: data.nombre || data.user?.nombre || formData.nombre,
        correo: data.correo || data.user?.correo || formData.correo,
        rol: data.rol || data.user?.rol || 'consumidor',
      }

      setUser(userData)
      return userData
    } catch (err) {
      let errorMessage = 'Ocurrió un error inesperado'
      if (err.response) {
        if (err.response.status === 409) {
          errorMessage = 'correo_duplicado'
        } else if (err.response.data && err.response.data.message) {
          errorMessage = Array.isArray(err.response.data.message)
            ? err.response.data.message[0]
            : err.response.data.message
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      throw new Error(errorMessage, { cause: err })
    } finally {
      setIsLoading(false)
    }
  }

  // Register business mutation
  const mutateBusiness = async (formData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.post('/auth/register/business', {
        nombre: formData.nombre,
        correo: formData.correo,
        contrasena: formData.contrasena,
        confirmacionContrasena: formData.confirmacionContrasena,
        consentimientoPrivacidad: formData.consentimientoPrivacidad,
        nombreNegocio: formData.nombreNegocio,
        direccionNegocio: formData.direccionNegocio,
        categoriaNegocio: formData.categoriaNegocio,
      })

      const data = response.data || {}
      const userData = {
        id: data.user?.id || data.id,
        nombre: data.user?.nombre || data.nombre || formData.nombre,
        correo: data.user?.correo || data.correo || formData.correo,
        rol: data.user?.rol || data.rol || 'negocio',
        negocio: data.user?.negocio || data.negocio || null,
      }

      setUser(userData)
      return userData
    } catch (err) {
      let errorMessage = 'Ocurrió un error inesperado'
      if (err.response) {
        if (err.response.status === 409) {
          errorMessage = 'correo_duplicado'
        } else if (err.response.data && err.response.data.message) {
          errorMessage = Array.isArray(err.response.data.message)
            ? err.response.data.message[0]
            : err.response.data.message
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      throw new Error(errorMessage, { cause: err })
    } finally {
      setIsLoading(false)
    }
  }
  // Login mutation
  const login = async (correo, contrasena) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.post('/auth/login', {
        correo,
        contrasena,
      })

      const data = response.data || {}
      const userData = {
        id: data.user?.id || data.id,
        nombre: data.user?.nombre || data.nombre || 'Usuario',
        correo: data.user?.correo || data.correo || correo,
        rol: data.user?.rol || data.rol || 'consumidor',
        negocio: data.user?.negocio || data.negocio || null,
      }

      setUser(userData)
      return userData
    } catch (err) {
      let errorMessage = 'Ocurrió un error inesperado'
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'credenciales_invalidas'
        } else if (err.response.data && err.response.data.message) {
          errorMessage = Array.isArray(err.response.data.message)
            ? err.response.data.message[0]
            : err.response.data.message
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      throw new Error(errorMessage, { cause: err })
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateBusiness, login, isLoading, error }
}
