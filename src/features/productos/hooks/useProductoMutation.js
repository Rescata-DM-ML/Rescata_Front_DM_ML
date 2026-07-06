import { useState } from 'react'
import { publicarProducto, subirImagenesProducto } from '../services/productos.api'

export default function useProductoMutation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const mutate = async (data, images = []) => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)
    try {
      const response = await publicarProducto(data)

      // If there are images, upload them
      if (images && images.length > 0) {
        await subirImagenesProducto(response.id, images)
      }

      setIsSuccess(true)
      return response
    } catch (err) {
      let errorMessage = 'Ocurrió un error inesperado'
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          errorMessage = Array.isArray(err.response.data.message)
            ? err.response.data.message[0]
            : err.response.data.message
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      setIsSuccess(false)
      throw new Error(errorMessage, { cause: err })
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading, error, isSuccess }
}
