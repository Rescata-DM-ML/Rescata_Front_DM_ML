import { useEffect, useState } from 'react'
import './Toast.css'

export default function Toast({ message, type = 'success', visible, onClose }) {
  const [shouldRender, setShouldRender] = useState(visible)
  const [animateClass, setAnimateClass] = useState(visible ? 'toast-fade-in' : '')
  const [prevVisible, setPrevVisible] = useState(visible)

  if (visible !== prevVisible) {
    setPrevVisible(visible)
    if (visible) {
      setShouldRender(true)
      setAnimateClass('toast-fade-in')
    } else {
      setAnimateClass('toast-fade-out')
    }
  }

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        if (onClose) onClose()
      }, 3000)
      return () => clearTimeout(timer)
    } else if (shouldRender) {
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300) // matches transition/animation duration
      return () => clearTimeout(timer)
    }
  }, [visible, onClose, shouldRender])

  if (!shouldRender) return null

  return (
    <div className={`toast-notification ${type} ${animateClass}`} role="alert">
      <div className="toast-content">
        {type === 'success' ? (
          // Success Check Icon
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="toast-icon"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : (
          // Error Icon
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="toast-icon"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        )}
        <span className="toast-message">{message}</span>
      </div>
      <button onClick={onClose} className="toast-close-btn" aria-label="Cerrar">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
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
  )
}
