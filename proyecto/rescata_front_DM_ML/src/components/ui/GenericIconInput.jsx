import './GenericIconInput.css';

export default function GenericIconInput({
  label,
  id,
  type = 'text',
  icon,
  error,
  success,
  register,
  showPasswordToggle,
  onPasswordToggle,
  isPasswordVisible,
  ...rest
}) {
  const hasError = !!error;
  const isSuccess = !!success && !error;

  return (
    <div className="generic-input-container">
      {label && (
        <label htmlFor={id} className="generic-input-label">
          {label}
        </label>
      )}
      <div className="generic-input-wrapper">
        {icon && <span className="generic-input-left-icon">{icon}</span>}
        <input
          id={id}
          type={type}
          className={`generic-input-field ${icon ? 'has-left-icon' : ''} ${
            showPasswordToggle ? 'has-right-action' : ''
          } ${hasError ? 'is-invalid' : isSuccess ? 'is-valid' : ''}`}
          {...(register ? register(id) : {})}
          {...rest}
        />

        {/* Password toggle eye icon button */}
        {showPasswordToggle && (
          <button
            type="button"
            className="generic-input-right-action-btn"
            onClick={onPasswordToggle}
            tabIndex={-1}
            aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {isPasswordVisible ? (
              // Eye Off Icon
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              // Eye Icon
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        )}

        {/* Right validation icon */}
        {hasError && (
          <span
            className={`generic-input-right-icon error-icon ${
              showPasswordToggle ? 'with-action' : ''
            }`}
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
        {isSuccess && (
          <span
            className={`generic-input-right-icon success-icon ${
              showPasswordToggle ? 'with-action' : ''
            }`}
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
        <span className={`generic-input-error-message ${hasError ? 'show' : ''}`}>
          {error}
        </span>
      </div>
    </div>
  );
}
