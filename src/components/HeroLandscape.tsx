import React from 'react';

export const HeroLandscape: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  return (
    <svg
      viewBox="0 0 800 240"
      preserveAspectRatio="xMaxYMid slice"
      className="w-full h-full object-cover select-none pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="atmSky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={darkMode ? '#24211b' : '#faf7f0'} />
          <stop offset="48%" stopColor={darkMode ? '#2b251c' : '#f5ead6'} />
          <stop offset="78%" stopColor={darkMode ? '#47341f' : '#ecc892'} />
          <stop offset="100%" stopColor={darkMode ? '#263427' : '#d5e0d1'} />
        </linearGradient>

        <radialGradient id="morningHalo" cx="76%" cy="28%" r="42%">
          <stop offset="0%" stopColor={darkMode ? '#e69b49' : '#fff8e1'} stopOpacity={darkMode ? '0.48' : '0.95'} />
          <stop offset="45%" stopColor={darkMode ? '#b86b24' : '#f2c179'} stopOpacity={darkMode ? '0.22' : '0.45'} />
          <stop offset="100%" stopColor="#f2c179" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="ridge1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={darkMode ? '#334236' : '#9eb29d'} stopOpacity="0.65" />
          <stop offset="100%" stopColor={darkMode ? '#232e25' : '#7b947c'} stopOpacity="0.85" />
        </linearGradient>

        <linearGradient id="ridge2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={darkMode ? '#283929' : '#5f7b5b'} />
          <stop offset="100%" stopColor={darkMode ? '#1c281d' : '#3d583c'} />
        </linearGradient>

        <linearGradient id="ridge3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={darkMode ? '#213022' : '#354f35'} />
          <stop offset="100%" stopColor={darkMode ? '#162017' : '#223623'} />
        </linearGradient>

        <linearGradient id="editorialFade" x1="0%" y1="0%" x2="62%" y2="0%">
          <stop offset="0%" stopColor={darkMode ? '#24211b' : '#faf7f0'} stopOpacity="1" />
          <stop offset="56%" stopColor={darkMode ? '#24211b' : '#faf7f0'} stopOpacity="0.95" />
          <stop offset="82%" stopColor={darkMode ? '#24211b' : '#faf7f0'} stopOpacity="0.32" />
          <stop offset="100%" stopColor={darkMode ? '#24211b' : '#faf7f0'} stopOpacity="0" />
        </linearGradient>

        <filter id="softBlur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Atmospheric Wash */}
      <rect width="800" height="240" fill="url(#atmSky)" />
      <rect width="800" height="240" fill="url(#morningHalo)" />

      {/* Soft Rising Sun Disc */}
      <circle
        cx="608"
        cy="68"
        r="28"
        fill={darkMode ? '#e59a47' : '#fff7dc'}
        opacity={darkMode ? '0.6' : '0.92'}
      />

      {/* Mist Band */}
      <ellipse
        cx="620"
        cy="142"
        rx="210"
        ry="24"
        fill={darkMode ? '#8a6c45' : '#fff6e3'}
        opacity={darkMode ? '0.14' : '0.45'}
        filter="url(#softBlur)"
      />

      {/* Layered Minimalist Hills */}
      <path
        d="M280 185 Q420 105 560 135 T800 108 L800 240 L280 240 Z"
        fill="url(#ridge1)"
      />
      <path
        d="M320 212 Q475 138 620 164 T800 140 L800 240 L320 240 Z"
        fill="url(#ridge2)"
      />
      <path
        d="M390 240 Q540 176 685 198 T800 184 L800 240 Z"
        fill="url(#ridge3)"
      />

      {/* Delicate Minimalist Botanical Araucaria Silhouettes */}
      <g transform="translate(698, 48)" opacity="0.92">
        <path
          d="M26 26 L26 170"
          stroke={darkMode ? '#141e15' : '#243725'}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <ellipse cx="26" cy="24" rx="30" ry="7.5" fill={darkMode ? '#182519' : '#273d29'} />
        <path
          d="M26 52 Q10 52 3 44 M26 48 Q42 48 50 40 M26 74 Q12 74 5 67 M26 70 Q41 70 48 63"
          stroke={darkMode ? '#141e15' : '#243725'}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="3" cy="43" rx="11" ry="3.6" fill={darkMode ? '#1d2d1e' : '#2f4931'} />
        <ellipse cx="50" cy="39" rx="12" ry="3.8" fill={darkMode ? '#1d2d1e' : '#2f4931'} />
        <ellipse cx="6" cy="66" rx="9" ry="3" fill={darkMode ? '#182519' : '#273d29'} />
        <ellipse cx="48" cy="62" rx="10" ry="3.2" fill={darkMode ? '#182519' : '#273d29'} />
      </g>

      <g transform="translate(642, 92) scale(0.68)" opacity="0.78">
        <path
          d="M26 24 L26 140"
          stroke={darkMode ? '#172318' : '#2c432e'}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="26" cy="22" rx="28" ry="7" fill={darkMode ? '#1d2c1e' : '#314b33'} />
        <ellipse cx="8" cy="42" rx="10" ry="3.2" fill={darkMode ? '#1d2c1e' : '#314b33'} />
        <ellipse cx="44" cy="40" rx="10" ry="3.2" fill={darkMode ? '#1d2c1e' : '#314b33'} />
      </g>

      {/* Smooth Editorial Left Fade */}
      <rect width="560" height="240" fill="url(#editorialFade)" />
    </svg>
  );
};
