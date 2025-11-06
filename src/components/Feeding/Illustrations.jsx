import React from 'react'

export function TableIllustration({ className = 'w-full h-auto' }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 128 96"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fillRule="evenodd">
        <rect
          x="12"
          y="14"
          width="104"
          height="54"
          rx="10"
          fill="#f7ede2"
          stroke="#b48144"
          strokeWidth="4"
        />
        <rect
          x="24"
          y="64"
          width="16"
          height="24"
          rx="4"
          fill="#d9a066"
          stroke="#a86b32"
          strokeWidth="3"
        />
        <rect
          x="88"
          y="64"
          width="16"
          height="24"
          rx="4"
          fill="#d9a066"
          stroke="#a86b32"
          strokeWidth="3"
        />
        <circle
          cx="64"
          cy="40"
          r="16"
          fill="#ffffff"
          stroke="#9ca3af"
          strokeWidth="3"
        />
        <circle
          cx="64"
          cy="40"
          r="9"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
        />
        <rect
          x="33"
          y="30"
          width="6"
          height="20"
          rx="2"
          fill="#e5e7eb"
          stroke="#9ca3af"
          strokeWidth="2"
        />
        <rect
          x="89"
          y="30"
          width="6"
          height="20"
          rx="2"
          fill="#e5e7eb"
          stroke="#9ca3af"
          strokeWidth="2"
        />
        <rect
          x="42"
          y="29"
          width="3"
          height="22"
          rx="1.5"
          fill="#f3f4f6"
          stroke="#9ca3af"
          strokeWidth="1.5"
        />
        <rect
          x="83"
          y="29"
          width="3"
          height="22"
          rx="1.5"
          fill="#f3f4f6"
          stroke="#9ca3af"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  )
}

export function ThoughtBubbleShape({
  className = 'w-full h-auto',
  fill = '#ffffff',
  stroke = '#d1d5db',
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 320 240"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M114 42.5c-4.6-16.8 8-32.5 26.3-32.5 11.7 0 21.9 6.6 26.7 16.3 7.5-5.3 16.5-8.3 26.1-8.3 23.8 0 44 17.2 47.8 40.2C271.1 64.1 292 87 292 114c0 40.1-32.5 72-72.6 72H185l-26 36-8-36h-8.4C96 186 56 146.2 56 98.8c0-35.8 28.7-64.9 64.3-65.8 2.8-.1 5.6.1 8.3.7Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <circle
        cx="78"
        cy="198"
        r="18"
        fill={fill}
        stroke={stroke}
        strokeWidth="8"
      />
      <circle
        cx="48"
        cy="220"
        r="12"
        fill={fill}
        stroke={stroke}
        strokeWidth="6"
      />
    </svg>
  )
}

export function BunnyIcon({ className = 'w-full h-auto', chewing = false }) {
  const mouthPath = chewing
    ? 'M48 112c0 4.5 8 7.5 16 7.5s16-3 16-7.5-8-4.5-16-4.5-16 0-16 4.5Z'
    : 'M44 108c0 8 9 14 20 14s20-6 20-14-9-6-20-6-20 0-20 6Z'

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 128 160"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill="#ffffff"
        stroke="#4b5563"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M36 16c0-8 6.5-12 12-12s12 4 12 12v28H36V16Z" fill="#f8fafc" />
        <path d="M68 16c0-8 6.5-12 12-12s12 4 12 12v28H68V16Z" fill="#f8fafc" />
        <path d="M28 64c0-20 16.5-36 36.5-36h-.3C84 28 100 44 100 64v22c0 22-17.9 40-39.9 40h-.2C45.9 126 28 108 28 86V64Z" fill="#f8fafc" />
        <ellipse cx="48" cy="72" rx="6" ry="8" fill="#4b5563" />
        <ellipse cx="80" cy="72" rx="6" ry="8" fill="#4b5563" />
        <path d={mouthPath} fill="#4b5563" stroke="none" />
        <path d="M52 120v16M76 120v16" />
        <path d="M32 108c-12 6-20 18-20 32v0c0 6.6 5.4 12 12 12h80c6.6 0 12-5.4 12-12v0c0-14-8-26-20-32" fill="#f1f5f9" />
      </g>
    </svg>
  )
}
