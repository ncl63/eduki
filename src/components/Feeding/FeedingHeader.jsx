import React from 'react'
import { Link } from 'react-router-dom'

function HomeIcon({ className = 'w-6 h-6' }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="m4.75 11.38 6.5-6.26a1 1 0 0 1 1.37 0l6.63 6.4a.75.75 0 0 1-.53 1.28h-.75V19a.75.75 0 0 1-.75.75h-3.25a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75V19a.75.75 0 0 1-.75.75H6.67A.75.75 0 0 1 5.92 19v-6.2h-.97a.75.75 0 0 1-.2-1.42Z"
      />
    </svg>
  )
}

function SettingsIcon({ className = 'w-6 h-6' }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M12.75 3.04a1 1 0 0 0-1.5 0l-1.27 1.42a6.83 6.83 0 0 0-1.88.49l-1.73-1a1 1 0 0 0-1.36.36l-1.5 2.6a1 1 0 0 0 .36 1.36l1.64.95a6.75 6.75 0 0 0 0 1.93l-1.64.95a1 1 0 0 0-.36 1.36l1.5 2.6a1 1 0 0 0 1.36.36l1.73-1a6.83 6.83 0 0 0 1.88.49l1.27 1.42a1 1 0 0 0 1.5 0l1.27-1.42a6.83 6.83 0 0 0 1.88-.49l1.73 1a1 1 0 0 0 1.36-.36l1.5-2.6a1 1 0 0 0-.36-1.36l-1.64-.95a6.75 6.75 0 0 0 0-1.93l1.64-.95a1 1 0 0 0 .36-1.36l-1.5-2.6a1 1 0 0 0-1.36-.36l-1.73 1a6.83 6.83 0 0 0-1.88-.49l-1.27-1.42Zm-.75 6.46a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"
      />
    </svg>
  )
}

export default function FeedingHeader({ title = 'Nourris le lapin', onOpenSettings }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white/70 px-4 backdrop-blur md:px-6">
      <Link
        to="/"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
        aria-label="Retour à l'accueil"
      >
        <HomeIcon className="w-6 h-6" />
      </Link>

      <h1 className="text-xl font-bold text-gray-900 md:text-2xl">{title}</h1>

      <button
        type="button"
        onClick={onOpenSettings}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
        aria-label="Ouvrir les réglages"
      >
        <SettingsIcon className="w-6 h-6" />
      </button>
    </header>
  )
}

