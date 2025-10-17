import React from 'react'

function RabbitEatingIcon({ className = 'w-6 h-6' }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fillRule="evenodd">
        <path
          d="M22 14c0-6 3.6-10 8-10s7 3 7 6-2.6 6.3-6 8c1-.1 2-.1 3-.1 9.4 0 17 7.2 17 16 0 8.9-7.6 16-17 16-.7 0-1.4 0-2.1-.1.7 1.9.1 4.3-2.9 6.5-3.9 2.9-10.6 3.1-14.6.5-4.3-2.7-4.7-7.3-2.3-10.5-4.8-2-8.1-6.6-8.1-11.9C3 25.2 11.2 17 21.5 17c.2 0 .4 0 .6.1-.1-1.1-.1-2.1-.1-3.1Z"
          fill="#fff"
        />
        <path
          d="M28.7 46.4c-.8.7-.7 1.8.3 2.2 1.2.5 3.5.6 4.9-.7 1.2-1.1 1.2-2.5.8-3.3-.4-.7-1.3-1-2-.4-.7.6-1.5.8-2.3.3-.7-.4-1.5-.1-1.7.8Z"
          fill="#f97316"
        />
        <circle cx="26" cy="27" r="2" fill="#111827" />
        <circle cx="42" cy="27" r="2" fill="#111827" />
        <path
          d="M33 32c2.6 0 5 2 5 4.5 0 3-2.4 5.5-5.5 5.5S27 39.5 27 36.5c0-2.5 2.4-4.5 6-4.5Z"
          fill="#111827"
        />
        <path
          d="M54 47c-1.2-2.4-3.4-3.1-5.3-2.6-1.2.3-1.7 1.8-.7 2.6 1.7 1.5 2 3.3 1.1 5.4-.6 1.4 1.1 2.7 2.4 1.9 2.4-1.5 3.3-4.7 2.5-7.3Z"
          fill="#f97316"
        />
      </g>
    </svg>
  )
}

export default function VerifyButton({
  onClick,
  disabled = false,
  children = 'Vérifier',
}) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-3 rounded-xl px-4 py-3 bg-gray-900 text-white text-lg font-semibold shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onClick}
      disabled={disabled}
      aria-label="Vérifier la mangeoire"
    >
      <RabbitEatingIcon className="w-7 h-7" />
      {children}
    </button>
  )
}

