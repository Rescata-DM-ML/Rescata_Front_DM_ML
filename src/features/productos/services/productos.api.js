import api from '../../../core/interceptors/axios.interceptor'

export async function getProductosCercanos({ lat, lng, radio = 10, page = 1, limit = 20 }) {
  const response = await api.get('/productos/cercanos', {
    params: { lat, lng, radio, page, limit },
  })
  return response.data
}

export async function publicarProducto(data) {
  const response = await api.post('/productos', data)
  return response.data
}

export async function subirImagenesProducto(id, files) {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('images', file)
  })
  const response = await api.post(`/productos/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}
