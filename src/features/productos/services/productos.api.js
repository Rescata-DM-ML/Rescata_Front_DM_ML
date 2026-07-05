import api from '../../../core/interceptors/axios.interceptor'

export async function getProductosCercanos({ lat, lng, radio = 10, page = 1, limit = 20 }) {
  const response = await api.get('/productos/cercanos', {
    params: { lat, lng, radio, page, limit },
  })
  return response.data
}
