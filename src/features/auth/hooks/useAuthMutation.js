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

      const wrappedData = response.data.data ? response.data.data : response.data
      const userData = {
        id: wrappedData.id || wrappedData.user?.id,
        nombre: wrappedData.nombre || wrappedData.user?.nombre || formData.nombre,
        correo: wrappedData.correo || wrappedData.user?.correo || formData.correo,
        rol: wrappedData.rol || wrappedData.user?.rol || 'consumidor',
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

      const wrappedData = response.data.data ? response.data.data : response.data
      const userData = {
        id: wrappedData.user?.id || wrappedData.id,
        nombre: wrappedData.user?.nombre || wrappedData.nombre || formData.nombre,
        correo: wrappedData.user?.correo || wrappedData.correo || formData.correo,
        rol: wrappedData.user?.rol || wrappedData.rol || 'negocio',
        negocio: wrappedData.user?.negocio || wrappedData.negocio || null,
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

      const wrappedData = response.data.data ? response.data.data : response.data
      const userData = {
        id: wrappedData.user?.id || wrappedData.id,
        nombre: wrappedData.user?.nombre || wrappedData.nombre || 'Usuario',
        correo: wrappedData.user?.correo || wrappedData.correo || correo,
        rol: wrappedData.user?.rol || wrappedData.rol || 'consumidor',
        negocio: wrappedData.user?.negocio || wrappedData.negocio || null,
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
