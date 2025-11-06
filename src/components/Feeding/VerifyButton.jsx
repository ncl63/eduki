import React from 'react'
import { BunnyIcon } from './Illustrations.jsx'

export default function VerifyButton({
  onClick,
  disabled = false,
  children = 'Vérifier',
}) {
  return (
    <button
      type="button"
      className="flex min-h-[56px] items-center justify-center gap-3 rounded-xl px-6 py-3.5 bg-gray-900 text-white text-lg font-semibold shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onClick}
      disabled={disabled}
      aria-label="Vérifier la mangeoire"
    >
      <BunnyIcon className="h-8 w-auto" chewing />
      {children}
    </button>
  )
}
