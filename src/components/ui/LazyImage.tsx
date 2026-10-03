import { useState } from 'react'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string
}

export default function LazyImage({ src, alt, className, containerClassName, ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className={`relative overflow-hidden bg-secondary/50 ${containerClassName || ''}`}>
      {/* Shimmer skeleton (visible while loading) */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-muted-foreground/20" />
      )}
      
      {/* Fallback for error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary text-muted-foreground text-xs p-2 text-center">
          Failed to load image
        </div>
      )}

      {/* Actual Image */}
      {src && !error && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          className={`transition-opacity duration-300 w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className || ''}`}
          {...props}
        />
      )}
    </div>
  )
}
