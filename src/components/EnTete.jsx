import React from 'react'
import { Link } from 'react-router-dom'

export default function EnTete() {
  return (
    <header className="mb-8">
      <nav className="text-sm text-gray-600">
        <Link to="/" className="hover:underline">Accueil</Link>
      </nav>
    </header>
  )
}
