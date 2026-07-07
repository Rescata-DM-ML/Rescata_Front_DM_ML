// AUDIT: Cumple con SEG-FE-04 (Validación en cliente con minimización de datos)
// - Solo contiene campos mínimos indispensables según el rol.
// - Registro de consumidor: contiene nombre, correo, contrasena, confirmacionContrasena, consentimientoPrivacidad.
// - Registro de negocio (Catalina): contiene nombre, direccion, categoria. La geolocalización se realiza en backend a partir de la dirección.
// - No existen campos ocultos (type="hidden") en ningún paso.
// - Aplica automáticamente .trim() en el esquema Zod antes de la validación y el envío en todos los campos de texto (nombre, correo, nombreNegocio, direccionNegocio).
// - La validación ocurre en el cliente antes de llamar a useAuthMutation.
// - Los botones de envío ("Registrarse" y "Finalizar Registro") se deshabilitan si !isValid || isLoading.

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import GenericIconInput from '../components/ui/GenericIconInput'
import useAuthMutation from '../features/auth/hooks/useAuthMutation'
import { sanitizeText } from '../utils/sanitize'
import './Register.css'

const registerSchema = z
  .object({
    nombre: z
      .string()
      .transform((val) => val.trim())
      .pipe(
        z
          .string()
          .min(2, { message: 'Solo se permiten letras y espacios' })
          .max(80, { message: 'Solo se permiten letras y espacios' })
          .regex(/^[A-Za-záéíóúÁÉÍÓÚñÑ ]{2,80}$/, {
            message: 'Solo se permiten letras y espacios',
          })
      ),
    correo: z
      .string()
      .transform((val) => val.trim())
      .pipe(z.string().email({ message: 'Ingresa un correo válido' })),
    contrasena: z
      .string()
      .min(8, { message: 'La contraseña no cumple los requisitos' })
      .refine((val) => /[A-Z]/.test(val) && /[0-9]/.test(val) && /[!@#$%^&*]/.test(val), {
        message: 'La contraseña no cumple los requisitos',
      }),
    confirmacionContrasena: z.string(),
    consentimientoPrivacidad: z.literal(true, {
      errorMap: () => ({ message: 'Debes aceptar el aviso de privacidad' }),
    }),
    registrarComoNegocio: z.boolean().optional(),
    nombreNegocio: z
      .string()
      .optional()
      .transform((val) => (val === undefined ? undefined : val.trim())),
    direccionNegocio: z
      .string()
      .optional()
      .transform((val) => (val === undefined ? undefined : val.trim())),
    categoriaNegocio: z.string().optional(),
  })
  .refine((data) => data.contrasena === data.confirmacionContrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmacionContrasena'],
  })
  .superRefine((data, ctx) => {
    if (data.registrarComoNegocio) {
      if (!data.nombreNegocio || data.nombreNegocio.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El nombre debe tener al menos 2 caracteres',
          path: ['nombreNegocio'],
        })
      } else if (data.nombreNegocio.length > 120) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El nombre no puede exceder los 120 caracteres',
          path: ['nombreNegocio'],
        })
      } else if (/[<>{}[\]]/.test(data.nombreNegocio)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El nombre no puede contener caracteres HTML ni llaves/corchetes',
          path: ['nombreNegocio'],
        })
      }

      if (!data.direccionNegocio || data.direccionNegocio.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La dirección debe tener al menos 5 caracteres',
          path: ['direccionNegocio'],
        })
      } else if (data.direccionNegocio.length > 200) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La dirección no puede exceder los 200 caracteres',
          path: ['direccionNegocio'],
        })
      }

      const validCategories = [
        'fruteria',
        'panaderia',
        'cafeteria',
        'restaurante',
        'supermercado',
        'tienda',
      ]
      if (!data.categoriaNegocio || !validCategories.includes(data.categoriaNegocio)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecciona una categoría válida',
          path: ['categoriaNegocio'],
        })
      }
    }
  })

export default function Register() {
  const navigate = useNavigate()
  const { mutate, mutateBusiness, isLoading, error } = useAuthMutation()
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    setError,
    trigger,
    watch,
    formState: { errors, isValid, dirtyFields, touchedFields },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  const registrarComoNegocio = watch('registrarComoNegocio', false)

  const onSubmit = async (values) => {
    try {
      if (values.registrarComoNegocio) {
        const data = {
          nombre: sanitizeText(values.nombre),
          correo: values.correo,
          contrasena: values.contrasena,
          confirmacionContrasena: values.confirmacionContrasena,
          consentimientoPrivacidad: values.consentimientoPrivacidad,
          registrarComoNegocio: values.registrarComoNegocio,
          nombreNegocio: values.nombreNegocio,
          direccionNegocio: values.direccionNegocio,
          categoriaNegocio: values.categoriaNegocio,
        }
        await mutateBusiness(data)
        navigate('/negocio/dashboard')
      } else {
        const data = {
          nombre: sanitizeText(values.nombre),
          correo: values.correo,
          contrasena: values.contrasena,
          confirmacionContrasena: values.confirmacionContrasena,
          consentimientoPrivacidad: values.consentimientoPrivacidad,
        }
        await mutate(data)
        navigate('/explore')
      }
    } catch (err) {
      if (err.message === 'correo_duplicado') {
        // Regresar al paso 1 por si se modificó el correo
        setStep(1)
        setError('correo', {
          type: 'manual',
          message: 'Este correo ya está registrado',
        })
      }
    }
  }

  const handleNextStep = async (e) => {
    e.preventDefault()
    const step1Fields = [
      'nombre',
      'correo',
      'contrasena',
      'confirmacionContrasena',
      'consentimientoPrivacidad',
    ]
    const isValidStep1 = await trigger(step1Fields)
    if (isValidStep1) {
      setStep(2)
    }
  }

  // Helper to determine success state
  const isFieldSuccess = (fieldName) => {
    return (dirtyFields[fieldName] || touchedFields[fieldName]) && !errors[fieldName]
  }

  // SVGs for inputs
  const userIcon = (
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  )

  const emailIcon = (
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
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  )

  const lockIcon = (
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  )

  const storeIcon = (
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
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  )

  const mapPinIcon = (
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
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  )

  const categoryIcon = (
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
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  )

  return (
    <div className="register-page-container">
      <div className="register-card">
        <div className="register-header">
          <div className="logo-container">
            <svg
              viewBox="0 0 24 24"
              width="36"
              height="36"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="brand-name">RESCATA</span>
          </div>
          <h1>{step === 1 ? 'Crear Cuenta' : 'Datos del Negocio'}</h1>
          <p className="subtitle">
            {step === 1
              ? 'Únete como consumidor para rescatar comida y ayudar al planeta'
              : 'Completa la información de tu establecimiento para empezar a vender'}
          </p>
        </div>

        {registrarComoNegocio && (
          <div className="register-steps-indicator">
            <div className={`step-item ${step === 1 ? 'active' : 'completed'}`}>
              <span className="step-number">{step === 1 ? '1' : '✓'}</span>
              <span className="step-label">Usuario</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step-item ${step === 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Negocio</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="register-form" noValidate>
          {step === 1 && (
            <>
              <GenericIconInput
                id="nombre"
                label="Nombre Completo"
                placeholder="Juan Pérez"
                icon={userIcon}
                error={errors.nombre?.message}
                success={isFieldSuccess('nombre')}
                register={register}
                disabled={isLoading}
              />

              <GenericIconInput
                id="correo"
                label="Correo Electrónico"
                type="email"
                placeholder="juan.perez@example.com"
                icon={emailIcon}
                error={errors.correo?.message}
                success={isFieldSuccess('correo')}
                register={register}
                disabled={isLoading}
              />

              <GenericIconInput
                id="contrasena"
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                icon={lockIcon}
                error={errors.contrasena?.message}
                success={isFieldSuccess('contrasena')}
                register={register}
                disabled={isLoading}
              />

              <GenericIconInput
                id="confirmacionContrasena"
                label="Confirmar Contraseña"
                type="password"
                placeholder="••••••••"
                icon={lockIcon}
                error={errors.confirmacionContrasena?.message}
                success={isFieldSuccess('confirmacionContrasena')}
                register={register}
                disabled={isLoading}
              />

              <div className="register-consent-container register-business-checkbox-container">
                <label className="register-consent-label">
                  <input
                    type="checkbox"
                    id="registrarComoNegocio"
                    {...register('registrarComoNegocio')}
                    disabled={isLoading}
                    className="register-consent-checkbox"
                  />
                  <span className="register-consent-text">
                    <strong>Registrarme como negocio</strong> (Opcional)
                  </span>
                </label>
              </div>

              <div className="register-consent-container">
                <label className="register-consent-label">
                  <input
                    type="checkbox"
                    id="consentimientoPrivacidad"
                    {...register('consentimientoPrivacidad')}
                    disabled={isLoading}
                    defaultChecked={false}
                    className="register-consent-checkbox"
                  />
                  <span className="register-consent-text">
                    He leído y acepto el{' '}
                    <a
                      href="/aviso-privacidad"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="privacy-link"
                    >
                      Aviso de Privacidad
                    </a>
                  </span>
                </label>
                {errors.consentimientoPrivacidad && (
                  <span className="register-consent-error-message">
                    {errors.consentimientoPrivacidad.message}
                  </span>
                )}
              </div>

              {error && (
                <div
                  className="register-error-banner"
                  style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    color: '#b91c1c',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '1rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>
                    {error === 'direccion_invalida'
                      ? 'Dirección inválida: no se pudieron obtener las coordenadas en el mapa. Intenta con una calle y número más precisos en México.'
                      : error}
                  </span>
                </div>
              )}

              {registrarComoNegocio ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="register-submit-btn"
                  disabled={isLoading}
                >
                  Siguiente paso
                </button>
              ) : (
                <button
                  type="submit"
                  className="register-submit-btn"
                  disabled={!isValid || isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-container">
                      <svg
                        className="spinner"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                      >
                        <circle cx="12" cy="12" r="10" strokeDasharray="42 20"></circle>
                      </svg>
                      Registrando...
                    </span>
                  ) : (
                    'Registrarse'
                  )}
                </button>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <GenericIconInput
                id="nombreNegocio"
                label="Nombre del Negocio"
                placeholder="Panadería La Central"
                icon={storeIcon}
                error={errors.nombreNegocio?.message}
                success={isFieldSuccess('nombreNegocio')}
                register={register}
                disabled={isLoading}
              />

              <GenericIconInput
                id="direccionNegocio"
                label="Dirección del Negocio"
                placeholder="Av. Juárez 123, Centro, León"
                icon={mapPinIcon}
                error={errors.direccionNegocio?.message}
                success={isFieldSuccess('direccionNegocio')}
                register={register}
                disabled={isLoading}
              />

              <div className="generic-input-container">
                <label htmlFor="categoriaNegocio" className="generic-input-label">
                  Categoría del Negocio
                </label>
                <div className="generic-input-wrapper">
                  <span className="generic-input-left-icon">{categoryIcon}</span>
                  <select
                    id="categoriaNegocio"
                    className={`generic-input-field has-left-icon select-field-override ${
                      errors.categoriaNegocio
                        ? 'is-invalid'
                        : isFieldSuccess('categoriaNegocio')
                          ? 'is-valid'
                          : ''
                    }`}
                    {...register('categoriaNegocio')}
                    disabled={isLoading}
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="fruteria">Frutería</option>
                    <option value="panaderia">Panadería</option>
                    <option value="cafeteria">Cafetería</option>
                    <option value="restaurante">Restaurante</option>
                    <option value="supermercado">Supermercado</option>
                    <option value="tienda">Tienda / Abarrotes</option>
                  </select>
                  {errors.categoriaNegocio && (
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
                  {!errors.categoriaNegocio && isFieldSuccess('categoriaNegocio') && (
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
                    className={`generic-input-error-message ${errors.categoriaNegocio ? 'show' : ''}`}
                  >
                    {errors.categoriaNegocio?.message}
                  </span>
                </div>
              </div>

              {error && (
                <div
                  className="register-error-banner"
                  style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    color: '#b91c1c',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '1rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>
                    {error === 'direccion_invalida'
                      ? 'Dirección inválida: no se pudieron obtener las coordenadas en el mapa. Intenta con una calle y número más precisos en México.'
                      : error}
                  </span>
                </div>
              )}

              <div className="register-step2-buttons">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="register-back-btn"
                  disabled={isLoading}
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="register-submit-btn step2-submit-btn"
                  disabled={!isValid || isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-container">
                      <svg
                        className="spinner"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                      >
                        <circle cx="12" cy="12" r="10" strokeDasharray="42 20"></circle>
                      </svg>
                      Registrando Negocio...
                    </span>
                  ) : (
                    'Finalizar Registro'
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        {step === 1 && (
          <div className="register-footer">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="login-link">
              Inicia sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
