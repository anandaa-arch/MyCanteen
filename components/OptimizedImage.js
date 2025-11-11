'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * Optimized Image Component
 * Wrapper around Next.js Image with loading states and error handling
 * 
 * @param {string} src - Image source
 * @param {string} alt - Alt text for accessibility
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {boolean} priority - Load image with high priority (for above-fold images)
 * @param {string} className - Additional CSS classes
 * @param {object} rest - Other props passed to Next/Image
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  fill = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  ...rest
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && !priority && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        quality={quality}
        priority={priority}
        className={className}
        onLoadingComplete={handleLoadingComplete}
        onError={handleError}
        {...rest}
      />
    </div>
  );
}
