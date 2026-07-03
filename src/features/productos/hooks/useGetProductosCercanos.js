import { useState, useEffect, useCallback } from 'react'
import { getProductosCercanos } from '../services/productos.api'

export default function useGetProductosCercanos() {
  const [coordenadas, setCoordenadas] = useState(null)
  const [permisoGeo, setPermisoGeo] = useState('pending')
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [error, setError] = useState(null)
  const [nextCursor, setNextCursor] = useState(null)
  const [hayMas, setHayMas] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const [estadoPermisoNativo, setEstadoPermisoNativo] = useState('prompt') // 'granted', 'denied', 'prompt'

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setEstadoPermisoNativo(result.state)
        result.onchange = () => {
          setEstadoPermisoNativo(result.state)
        }
      }).catch(err => {
        console.warn('Error al consultar permisos de geolocalización:', err)
      })
    }
  }, [])

  console.log('[DEBUG] Hook Render - permisoGeo:', permisoGeo, 'estadoPermisoNativo:', estadoPermisoNativo, 'coords:', coordenadas, 'productos:', productos.length)

  const solicitarGeolocalizacion = useCallback(() => {
    if (!navigator.geolocation) {
      setPermisoGeo('denied')
      setCoordenadas(null)
      setProductos([])
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('[DEBUG] Geolocalización EXITOSA - posición:', position.coords)
        setCoordenadas({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setPermisoGeo('granted')
        setEstadoPermisoNativo('granted')
      },
      (err) => {
        console.warn('[DEBUG] Geolocalización FALLIDA - error:', err)
        setPermisoGeo('denied')
        setEstadoPermisoNativo('denied')
        setCoordenadas(null)
        setProductos([])
      }
    )
  }, [])

  const cargarProductos = useCallback(
    async (esCargaInicial = false) => {
      console.log('[DEBUG] cargarProductos llamado - coords:', coordenadas, 'esCargaInicial:', esCargaInicial)
      if (!coordenadas) return

      const pageToFetch = esCargaInicial ? 1 : paginaActual + 1

      if (esCargaInicial) {
        setCargando(true)
        setError(null)
      } else {
        setCargandoMas(true)
      }

      try {
        const resultado = await getProductosCercanos({
          lat: coordenadas.lat,
          lng: coordenadas.lng,
          page: pageToFetch,
        })

        // Robust handling of response structure:
        // Case A: resultado is { data: [...], nextCursor: ... }
        // Case B: resultado is { success: true, data: { data: [...], nextCursor: ... } }
        // Case C: resultado is just direct array (fallback)
        let dataArray = []
        let cursorVal = null

        if (resultado) {
          if (Array.isArray(resultado.data)) {
            dataArray = resultado.data
            cursorVal = resultado.nextCursor !== undefined ? resultado.nextCursor : null
          } else if (resultado.data && Array.isArray(resultado.data.data)) {
            dataArray = resultado.data.data
            cursorVal = resultado.data.nextCursor !== undefined ? resultado.data.nextCursor : null
          } else if (Array.isArray(resultado)) {
            dataArray = resultado
          }
        }

        console.log('[DEBUG] API retornó ofertas:', dataArray.length)
        setProductos((prev) => (esCargaInicial ? dataArray : [...prev, ...dataArray]))

        setNextCursor(cursorVal)
        setHayMas(cursorVal !== null && dataArray.length > 0)
        setPaginaActual(pageToFetch)
      } catch (err) {
        console.error('Error al cargar productos cercanos:', err)
        setError('No pudimos cargar las ofertas cercanas. Intenta de nuevo.')
      } finally {
        setCargando(false)
        setCargandoMas(false)
      }
    },
    [coordenadas, paginaActual]
  )

  // Al montar, intentar solicitar la geolocalización automáticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      solicitarGeolocalizacion()
    }, 0)
    return () => clearTimeout(timer)
  }, [solicitarGeolocalizacion])

  // Cuando cambian las coordenadas y el permiso está granted, cargar inicial
  useEffect(() => {
    if (coordenadas && permisoGeo === 'granted') {
      const timer = setTimeout(() => {
        cargarProductos(true)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [coordenadas, permisoGeo, cargarProductos])

  return {
    productos,
    cargando,
    cargandoMas,
    error,
    nextCursor,
    hayMas,
    permisoGeo,
    estadoPermisoNativo,
    coordenadas,
    solicitarGeolocalizacion,
    denegarPermisoManual: () => {
      setPermisoGeo('denied')
      setCoordenadas(null)
      setProductos([])
    },
    cargarMas: () => cargarProductos(false),
  }
}
