import './LoadingSkeleton.css'

export default function LoadingSkeleton({ cantidad = 6 }) {
  const skeletons = Array.from({ length: cantidad })

  return (
    <div className="skeleton-grid">
      {skeletons.map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-image"></div>
          <div className="skeleton-info">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-price-dist"></div>
            <div className="skeleton-line skeleton-business"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
