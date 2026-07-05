import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import GenericIconInput from '../components/ui/GenericIconInput'
import useProductoMutation from '../features/productos/hooks/useProductoMutation'
import Toast from '../components/shared/Toast'
import ProductFeedCard from '../components/shared/ProductFeedCard'
import { useAuthStore } from '../features/auth/stores/auth.store'
import './PublicarProducto.css'

const schema = z
  .object({
    nombre: z
      .string()
      .transform((val) => val.trim())
      .pipe(
        z
          .string()
          .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
          .max(100, { message: 'El nombre no puede exceder los 100 caracteres' })
          .regex(/^[^<>{}[\]"']*$/, { message: 'No se permiten caracteres HTML ni scripts' })
      ),
    descripcion: z
      .string()
      .default('')
      .transform((val) => val.trim())
      .pipe(
        z
          .string()
          .max(500, { message: 'La descripción no puede exceder los 500 caracteres' })
          .regex(/^[^<>{}[\]"']*$/, { message: 'No se permiten caracteres HTML ni scripts' })
          .or(z.literal(''))
      ),
    precioOriginal: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return undefined
        const num = Number(val)
        return isNaN(num) ? undefined : num
      },
      z
        .number({
          required_error: 'El precio original es requerido',
          invalid_type_error: 'Debe ser un número',
        })
        .positive({ message: 'El precio debe ser mayor a cero' })
        .multipleOf(0.01, { message: 'El precio no puede tener más de 2 decimales' })
    ),
    precioOferta: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return undefined
        const num = Number(val)
        return isNaN(num) ? undefined : num
      },
      z
        .number({
          required_error: 'El precio de oferta es requerido',
          invalid_type_error: 'Debe ser un número',
        })
        .positive({ message: 'El precio debe ser mayor a cero' })
        .multipleOf(0.01, { message: 'El precio no puede tener más de 2 decimales' })
    ),
    cantidadDisponible: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return undefined
        const num = Number(val)
        return isNaN(num) ? undefined : num
      },
      z
        .number({
          required_error: 'La cantidad disponible es requerida',
          invalid_type_error: 'Debe ser un número',
        })
        .int({ message: 'La cantidad debe ser un número entero' })
        .min(1, { message: 'La cantidad mínima es 1' })
        .max(9999, { message: 'La cantidad máxima es 9999' })
    ),
    fechaCaducidad: z
      .string({ required_error: 'La fecha de caducidad es requerida' })
      .min(1, { message: 'La fecha de caducidad es requerida' })
      .transform((val) => new Date(val + 'T00:00:00'))
      .refine((date) => date > new Date(), {
        message: 'La fecha debe ser futura',
      }),
  })
  .superRefine((data, ctx) => {
    if (
      data.precioOferta !== undefined &&
      data.precioOriginal !== undefined &&
      data.precioOferta >= data.precioOriginal
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El precio de oferta debe ser menor al precio original',
        path: ['precioOferta'],
      })
    }
  })

export default function PublicarProducto() {
  const navigate = useNavigate()
  const { mutate, isLoading } = useProductoMutation()
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })
  const [selectedImages, setSelectedImages] = useState([])
  const user = useAuthStore((state) => state.user)
  const [tomorrowStr] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, dirtyFields, touchedFields },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })

  const watchedValues = watch()
  const nombreNegocio = user?.negocio?.nombre || 'Mi Negocio'
  const calificacionNegocio = user?.negocio?.calificacionPromedio || 5.0

  const mockProduct = {
    id: 'preview',
    nombre: watchedValues.nombre || 'Nombre del Producto',
    precioOriginal: watchedValues.precioOriginal ? Number(watchedValues.precioOriginal) : 0,
    precioOferta: watchedValues.precioOferta ? Number(watchedValues.precioOferta) : 0,
    distanciaKm: 0.0,
    fotoUrl: selectedImages[0]?.previewUrl || null,
    fechaCaducidad: watchedValues.fechaCaducidad
      ? new Date(watchedValues.fechaCaducidad + 'T23:59:59')
      : new Date(tomorrowStr + 'T23:59:59'),
    negocio: {
      nombre: nombreNegocio,
      calificacionPromedio: calificacionNegocio,
    },
  }

  const isFieldSuccess = (fieldName) => {
    return (dirtyFields[fieldName] || touchedFields[fieldName]) && !errors[fieldName]
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const maxAllowed = 3 - selectedImages.length
    if (files.length > maxAllowed) {
      setToast({
        visible: true,
        message: 'No puedes agregar más de 3 imágenes en total.',
        type: 'error',
      })
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5 MB

    const newImages = []
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setToast({
          visible: true,
          message: 'Formato no permitido. Solo JPG, PNG o WEBP',
          type: 'error',
        })
        return
      }

      if (file.size > maxSize) {
        setToast({
          visible: true,
          message: 'El archivo supera el límite de 5 MB',
          type: 'error',
        })
        return
      }

      newImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }

    setSelectedImages((prev) => [...prev, ...newImages])
  }

  const handleRemoveImage = (index) => {
    const target = selectedImages[index]
    if (target) {
      URL.revokeObjectURL(target.previewUrl)
    }
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== index))
  }

  const onSubmit = async (data) => {
    try {
      const files = selectedImages.map((img) => img.file)
      await mutate(
        {
          nombre: data.nombre,
          descripcion: data.descripcion || '',
          precioOriginal: data.precioOriginal,
          precioOferta: data.precioOferta,
          cantidadDisponible: data.cantidadDisponible,
          fechaCaducidad: data.fechaCaducidad.toISOString(),
        },
        files
      )

      setToast({
        visible: true,
        message: '¡Producto publicado correctamente!',
        type: 'success',
      })
      // Free preview URLs and clear images
      selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl))
      setSelectedImages([])
      reset()
    } catch (err) {
      setToast({
        visible: true,
        message: err.message || 'Error al publicar el producto',
        type: 'error',
      })
    }
  }

  // Icons
  const packageIcon = (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  )

  const priceIcon = (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  )

  const quantityIcon = (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="9" x2="20" y2="9"></line>
      <line x1="4" y1="15" x2="20" y2="15"></line>
      <line x1="10" y1="3" x2="8" y2="21"></line>
      <line x1="16" y1="3" x2="14" y2="21"></line>
    </svg>
  )

  const calendarIcon = (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  )

  return (
    <main className="publish-page-container">
      <div
        className="publish-form-column"
        style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '580px' }}
      >
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
          <button onClick={() => navigate(-1)} className="btn-back">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Atrás</span>
          </button>
        </div>

        <div className="publish-card">
          <div className="publish-header">
            <h1>Publicar Producto</h1>
            <p className="subtitle">Completa los datos de tu oferta</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="publish-form" noValidate>
            {/* Sección 1: Información Básica */}
            <div className="publish-form-section">
              <h3 className="publish-section-title">Información Básica</h3>

              <GenericIconInput
                id="nombre"
                label="Nombre del Producto"
                placeholder="Ej. Paquete de Donas Surtidas"
                icon={packageIcon}
                error={errors.nombre?.message}
                success={isFieldSuccess('nombre')}
                register={register}
                disabled={isLoading}
              />

              <div className="generic-input-container">
                <label htmlFor="descripcion" className="generic-input-label">
                  Descripción
                </label>
                <div className="generic-input-wrapper">
                  <textarea
                    id="descripcion"
                    className={`generic-input-field ${
                      errors.descripcion
                        ? 'is-invalid'
                        : isFieldSuccess('descripcion')
                          ? 'is-valid'
                          : ''
                    }`}
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    placeholder="Detalles del producto (ej. estado, alérgenos, etc.)"
                    {...register('descripcion')}
                    disabled={isLoading}
                  />
                  {errors.descripcion && (
                    <span
                      className="generic-input-right-icon error-icon"
                      style={{ alignSelf: 'flex-start', marginTop: '0.75rem' }}
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </span>
                  )}
                  {isFieldSuccess('descripcion') && (
                    <span
                      className="generic-input-right-icon success-icon"
                      style={{ alignSelf: 'flex-start', marginTop: '0.75rem' }}
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                  )}
                </div>
                <div className="generic-input-error-wrapper">
                  <span
                    className={`generic-input-error-message ${errors.descripcion ? 'show' : ''}`}
                  >
                    {errors.descripcion?.message}
                  </span>
                </div>
              </div>
            </div>

            {/* Sección 2: Precios y Disponibilidad */}
            <div className="publish-form-section">
              <h3 className="publish-section-title">Precios y Stock</h3>

              <div className="publish-form-row">
                <div className="generic-input-container">
                  <label htmlFor="precioOriginal" className="generic-input-label">
                    Precio Original
                  </label>
                  <div className="generic-input-wrapper">
                    <span className="generic-input-left-icon">{priceIcon}</span>
                    <input
                      id="precioOriginal"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      className={`generic-input-field has-left-icon ${
                        errors.precioOriginal
                          ? 'is-invalid'
                          : isFieldSuccess('precioOriginal')
                            ? 'is-valid'
                            : ''
                      }`}
                      {...register('precioOriginal')}
                      disabled={isLoading}
                    />
                    {errors.precioOriginal && (
                      <span className="generic-input-right-icon error-icon" aria-hidden="true">
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </span>
                    )}
                    {isFieldSuccess('precioOriginal') && (
                      <span className="generic-input-right-icon success-icon" aria-hidden="true">
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="generic-input-error-wrapper">
                    <span
                      className={`generic-input-error-message ${errors.precioOriginal ? 'show' : ''}`}
                    >
                      {errors.precioOriginal?.message}
                    </span>
                  </div>
                </div>

                <div className="generic-input-container">
                  <label htmlFor="precioOferta" className="generic-input-label">
                    Precio Oferta
                  </label>
                  <div className="generic-input-wrapper">
                    <span className="generic-input-left-icon">{priceIcon}</span>
                    <input
                      id="precioOferta"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      className={`generic-input-field has-left-icon ${
                        errors.precioOferta
                          ? 'is-invalid'
                          : isFieldSuccess('precioOferta')
                            ? 'is-valid'
                            : ''
                      }`}
                      {...register('precioOferta')}
                      disabled={isLoading}
                    />
                    {errors.precioOferta && (
                      <span className="generic-input-right-icon error-icon" aria-hidden="true">
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </span>
                    )}
                    {isFieldSuccess('precioOferta') && (
                      <span className="generic-input-right-icon success-icon" aria-hidden="true">
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="generic-input-error-wrapper">
                    <span
                      className={`generic-input-error-message ${errors.precioOferta ? 'show' : ''}`}
                    >
                      {errors.precioOferta?.message}
                    </span>
                  </div>
                </div>
              </div>

              <div className="publish-form-row">
                <div className="generic-input-container">
                  <label htmlFor="cantidadDisponible" className="generic-input-label">
                    Cantidad Disponible
                  </label>
                  <div className="generic-input-wrapper">
                    <span className="generic-input-left-icon">{quantityIcon}</span>
                    <input
                      id="cantidadDisponible"
                      type="number"
                      step="1"
                      min="1"
                      max="9999"
                      placeholder="1"
                      className={`generic-input-field has-left-icon ${
                        errors.cantidadDisponible
                          ? 'is-invalid'
                          : isFieldSuccess('cantidadDisponible')
                            ? 'is-valid'
                            : ''
                      }`}
                      {...register('cantidadDisponible')}
                      disabled={isLoading}
                    />
                    {errors.cantidadDisponible && (
                      <span className="generic-input-right-icon error-icon" aria-hidden="true">
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </span>
                    )}
                    {isFieldSuccess('cantidadDisponible') && (
                      <span className="generic-input-right-icon success-icon" aria-hidden="true">
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="generic-input-error-wrapper">
                    <span
                      className={`generic-input-error-message ${errors.cantidadDisponible ? 'show' : ''}`}
                    >
                      {errors.cantidadDisponible?.message}
                    </span>
                  </div>
                </div>

                <div className="generic-input-container">
                  <label htmlFor="fechaCaducidad" className="generic-input-label">
                    Fecha de Caducidad
                  </label>
                  <div className="generic-input-wrapper">
                    <span className="generic-input-left-icon">{calendarIcon}</span>
                    <input
                      id="fechaCaducidad"
                      type="date"
                      min={tomorrowStr}
                      className={`generic-input-field has-left-icon ${
                        errors.fechaCaducidad
                          ? 'is-invalid'
                          : isFieldSuccess('fechaCaducidad')
                            ? 'is-valid'
                            : ''
                      }`}
                      {...register('fechaCaducidad')}
                      disabled={isLoading}
                    />
                    {errors.fechaCaducidad && (
                      <span className="generic-input-right-icon error-icon" aria-hidden="true">
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </span>
                    )}
                    {isFieldSuccess('fechaCaducidad') && (
                      <span className="generic-input-right-icon success-icon" aria-hidden="true">
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="generic-input-error-wrapper">
                    <span
                      className={`generic-input-error-message ${errors.fechaCaducidad ? 'show' : ''}`}
                    >
                      {errors.fechaCaducidad?.message}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={!isValid || isLoading} className="publish-submit-btn">
              {isLoading ? (
                <div className="publish-spinner-container">
                  <svg
                    className="publish-spinner"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"></circle>
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Publicando...</span>
                </div>
              ) : (
                'Publicar'
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="publish-preview-section">
        <span className="publish-preview-title">Vista Previa</span>
        <div onClick={(e) => e.preventDefault()} style={{ width: '100%', marginBottom: '1.5rem' }}>
          <ProductFeedCard producto={mockProduct} />
        </div>

        {/* Sección 3: Fotografías */}
        <div className="publish-form-section" style={{ width: '100%' }}>
          <h3 className="publish-section-title" style={{ marginTop: 0 }}>
            Fotografías del Producto
          </h3>
          <div className="publish-images-container">
            {selectedImages.map((img, index) => (
              <div key={index} className="publish-image-thumbnail-wrapper">
                <img
                  src={img.previewUrl}
                  alt={`Vista previa ${index + 1}`}
                  className="publish-image-thumbnail"
                />
                <button
                  type="button"
                  className="publish-image-delete-btn"
                  onClick={() => handleRemoveImage(index)}
                  aria-label="Eliminar imagen"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}

            {selectedImages.length < 3 && (
              <label className="publish-image-upload-trigger">
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  disabled={isLoading}
                />
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="upload-icon"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span className="upload-text">Subir foto</span>
              </label>
            )}
          </div>
        </div>
      </div>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </main>
  )
}
