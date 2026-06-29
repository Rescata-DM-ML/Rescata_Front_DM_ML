import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import GenericIconInput from '../components/ui/GenericIconInput';
import useAuthMutation from '../features/auth/hooks/useAuthMutation';
import './Register.css';

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
      .refine(
        (val) =>
          /[A-Z]/.test(val) && /[0-9]/.test(val) && /[!@#$%^&*]/.test(val),
        { message: 'La contraseña no cumple los requisitos' }
      ),
    confirmacionContrasena: z.string(),
  })
  .refine((data) => data.contrasena === data.confirmacionContrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmacionContrasena'],
  });

export default function Register() {
  const navigate = useNavigate();
  const { mutate, isLoading } = useAuthMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid, dirtyFields, touchedFields },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    try {
      await mutate(data);
      navigate('/');
    } catch (err) {
      if (err.message === 'correo_duplicado') {
        setError('correo', {
          type: 'manual',
          message: 'Este correo ya está registrado',
        });
      }
    }
  };

  // Helper to determine success state
  const isFieldSuccess = (fieldName) => {
    return (
      (dirtyFields[fieldName] || touchedFields[fieldName]) &&
      !errors[fieldName]
    );
  };

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
  );

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
  );

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
  );

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
          <h1>Crear Cuenta</h1>
          <p className="subtitle">
            Únete como consumidor para rescatar comida y ayudar al planeta
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="register-form"
          noValidate
        >
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
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    strokeDasharray="42 20"
                  ></circle>
                </svg>
                Registrando...
              </span>
            ) : (
              'Registrarse'
            )}
          </button>
        </form>

        <div className="register-footer">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="login-link">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
