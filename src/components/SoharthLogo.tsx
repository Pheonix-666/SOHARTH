'use client';
import Image from 'next/image';

interface SoharthLogoProps {
  variant?: 'image' | 'text' | 'combined';
  height?: number;
  width?: number;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function SoharthLogo({
  variant = 'combined',
  height = 32,
  width,
  fontSize = '1.25rem',
  className = '',
  style = {},
}: SoharthLogoProps) {
  // If variant is image only, render the uploaded logo image
  if (variant === 'image') {
    return (
      <div
        className={`soharth-logo-img-wrapper ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: `${height}px`,
          position: 'relative',
          ...style,
        }}
      >
        <Image
          src="/soharth-logo.jpg"
          alt="SOHARTH"
          width={width || height * 3.5}
          height={height}
          priority
          style={{
            objectFit: 'contain',
            maxHeight: '100%',
            width: 'auto',
            filter: 'contrast(1.1) brightness(1.05)',
          }}
        />
      </div>
    );
  }

  // If variant is text only, render live text in custom SOHARTH brand font
  if (variant === 'text') {
    return (
      <span
        className={`soharth-font ${className}`}
        style={{
          fontSize,
          color: 'var(--primary, #ffffff)',
          letterSpacing: '0.15em',
          fontWeight: 900,
          textTransform: 'uppercase',
          display: 'inline-block',
          ...style,
        }}
      >
        SOHARTH
      </span>
    );
  }

  // Default 'combined': Wordmark image with live font fallback / high clarity
  return (
    <div
      className={`soharth-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        ...style,
      }}
    >
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Image
          src="/soharth-logo.jpg"
          alt="SOHARTH"
          width={width || height * 3.2}
          height={height}
          priority
          style={{
            objectFit: 'contain',
            height: '100%',
            width: 'auto',
            mixBlendMode: 'screen',
          }}
        />
      </div>
    </div>
  );
}
