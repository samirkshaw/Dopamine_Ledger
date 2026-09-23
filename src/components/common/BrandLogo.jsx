import React from 'react';
import logoUrl from '../../assets/logo.jpg';

/**
 * BrandLogo - The Infinite Ladder Climbing Mark
 * Represents continuous discipline, upward momentum, and striving towards achievements.
 */
export function BrandLogo({ size = 40, rounded = 12, style = {}, className = '' }) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#09070F',
        border: '1px solid rgba(245, 200, 105, 0.25)',
        boxShadow: '0 4px 16px rgba(245, 200, 105, 0.25)',
        flexShrink: 0,
        position: 'relative',
        ...style,
      }}
    >
      <img
        src={logoUrl}
        alt="Dopamine Ledger Logo - Infinite Ladder Climb"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
}

export default BrandLogo;
