import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  // Größen-Konfiguration
  const sizeClasses = {
    sm: {
      shieldWidth: 28,
      shieldHeight: 28,
      flagHeight: 28,
      flagWidth: 3,
      fontSize: '0.75rem',
      gap: '8px'
    },
    md: {
      shieldWidth: 46,
      shieldHeight: 46,
      flagHeight: 46,
      flagWidth: 4,
      fontSize: '1.05rem',
      gap: '12px'
    },
    lg: {
      shieldWidth: 80,
      shieldHeight: 80,
      flagHeight: 80,
      flagWidth: 7,
      fontSize: '1.6rem',
      gap: '20px'
    }
  };

  const config = sizeClasses[size];

  return (
    <div 
      className={`justiz-logo-container ${className}`} 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: config.gap,
        userSelect: 'none'
      }}
    >
      {/* 1. Schild-Wappen mit Waagschale (Silber/Grau) */}
      <svg 
        viewBox="0 0 100 100" 
        width={config.shieldWidth} 
        height={config.shieldHeight}
        style={{
          color: '#7f8c8d', // Edles Silbergrau
          flexShrink: 0
        }}
      >
        {/* Schildumriss (3D-Effekt) */}
        <path 
          d="M 50 5 Q 75 5 85 18 C 85 52 75 82 50 95 C 25 82 15 52 15 18 Q 25 5 50 5 Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Innenschattierung für Tiefe */}
        <path 
          d="M 50 9 Q 71 9 80 20 C 80 49 71 76 50 88 C 29 76 20 49 20 20 Q 29 9 50 9 Z" 
          fill="none" 
          stroke="rgba(127, 140, 141, 0.3)" 
          strokeWidth="2"
        />

        {/* Waagschale */}
        {/* Standfuß */}
        <path d="M 32 76 L 68 76" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M 50 76 L 50 71" stroke="currentColor" strokeWidth="5" />
        
        {/* Vertikale Säule */}
        <line x1="50" y1="71" x2="50" y2="30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        
        {/* Spitze oben */}
        <polygon points="50,22 47,28 53,28" fill="currentColor" />
        
        {/* Waagbalken */}
        <line x1="26" y1="36" x2="74" y2="36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        
        {/* Aufhängung links */}
        <line x1="28" y1="36" x2="20" y2="58" stroke="currentColor" strokeWidth="2.5" />
        <line x1="28" y1="36" x2="36" y2="58" stroke="currentColor" strokeWidth="2.5" />
        {/* Schale links */}
        <path d="M 18 58 Q 28 66 38 58 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />

        {/* Aufhängung rechts */}
        <line x1="72" y1="36" x2="64" y2="58" stroke="currentColor" strokeWidth="2.5" />
        <line x1="72" y1="36" x2="80" y2="58" stroke="currentColor" strokeWidth="2.5" />
        {/* Schale rechts */}
        <path d="M 62 58 Q 72 64 82 58 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {/* 2. Vertikale Flaggen-Trennlinie (Schwarz-Rot-Gold) */}
      <div 
        className="logo-flag-bar"
        style={{
          width: config.flagWidth,
          height: config.flagHeight,
          background: 'linear-gradient(to bottom, #000000 33.3%, #dd0000 33.3%, #dd0000 66.6%, #ffcc00 66.6%)',
          flexShrink: 0
        }}
      />

      {/* 3. Textbezeichnung rechts */}
      <div 
        className="logo-text-block"
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontWeight: 800,
          fontFamily: 'var(--font-display)',
          lineHeight: 1.1,
          fontSize: config.fontSize,
          color: 'var(--text-primary)',
          letterSpacing: '0.2px',
          textAlign: 'left'
        }}
      >
        <span>AMT FÜR JUSTIZ</span>
        <span>UND</span>
        <span>VERBRAUCHERRECHT</span>
      </div>
    </div>
  );
}
