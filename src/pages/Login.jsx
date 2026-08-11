// AUDIT: Cumple con SEG-FE-04 (Validación en cliente con minimización de datos)
// - Solo contiene campos mínimos indispensables (correo, contrasena) en el DOM.
// - No existen campos ocultos (type="hidden").
// - Aplica automáticamente .trim() al correo mediante el esquema Zod antes de la validación y el envío.
// - La validación ocurre del lado del cliente antes de cualquier petición HTTP (con handleSubmit).
// - El botón de envío está deshabilitado si el formulario es inválido o está cargando.

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import GenericIconInput from '../components/ui/GenericIconInput'
import useAuthMutation from '../features/auth/hooks/useAuthMutation'
import { sanitizeText } from '../utils/sanitize'
import './Login.css'

const loginSchema = z.object({
  correo: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().email({ message: 'Ingresa un correo válido' })),
  contrasena: z.string().min(1, { message: 'Ingresa tu contraseña' }),
})

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthMutation()

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState(0)
  const [loginError, setLoginError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, touchedFields },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  // Countdown timer for brute force lockout
  useEffect(() => {
    let timer
    if (lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            setFailedAttempts(0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [lockoutTime])

  const onSubmit = async (values) => {
    if (lockoutTime > 0) return
    setLoginError(null)

    const data = {
      correo: sanitizeText(values.correo),
      contrasena: values.contrasena,
    }

    try {
      await login(data.correo, data.contrasena)
      setFailedAttempts(0) // Reset consecutive failed attempts on success
      navigate('/')
    } catch (err) {
      if (err.message === 'credenciales_invalidas') {
        setLoginError('Correo o contraseña incorrectos')
        const nextAttempts = failedAttempts + 1
        setFailedAttempts(nextAttempts)
        if (nextAttempts >= 5) {
          setLockoutTime(30)
        }
      } else {
        setLoginError('Ocurrió un error al iniciar sesión. Inténtalo de nuevo.')
      }
    }
  }

  const isFieldSuccess = (fieldName) => {
    return (dirtyFields[fieldName] || touchedFields[fieldName]) && !errors[fieldName]
  }

  // SVGs for inputs
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

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
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
          <h1>Iniciar Sesión</h1>
          <p className="subtitle">Accede a tu cuenta para salvar excedentes de alimentos</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
          <GenericIconInput
            id="correo"
            label="Correo Electrónico"
            type="email"
            placeholder="correo@ejemplo.com"
            icon={emailIcon}
            error={errors.correo?.message}
            success={isFieldSuccess('correo')}
            register={register}
            disabled={isLoading || lockoutTime > 0}
          />

          <GenericIconInput
            id="contrasena"
            label="Contraseña"
            type={isPasswordVisible ? 'text' : 'password'}
            placeholder="••••••••"
            icon={lockIcon}
            error={errors.contrasena?.message}
            success={isFieldSuccess('contrasena')}
            register={register}
            disabled={isLoading || lockoutTime > 0}
            showPasswordToggle={true}
            isPasswordVisible={isPasswordVisible}
            onPasswordToggle={() => setIsPasswordVisible(!isPasswordVisible)}
          />

          {loginError && (
            <div className="login-global-error" role="alert">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading || lockoutTime > 0}
          >
            {lockoutTime > 0 ? (
              `Intenta de nuevo en ${lockoutTime}s`
            ) : isLoading ? (
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
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <div className="login-footer">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="register-link">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  )
}
