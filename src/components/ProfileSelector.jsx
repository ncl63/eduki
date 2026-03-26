import React, { useState, useRef, useEffect } from 'react'
import { useProfile } from '../contexts/ProfileContext.jsx'

const EMOJI_OPTIONS = ['🧒', '👦', '👧', '🐰', '🐱', '🦊', '🐻', '🦁', '🐸', '🌟', '🦋', '🐬']

export default function ProfileSelector() {
  const { profiles, activeProfile, setActiveProfile, addProfile, removeProfile } = useProfile()
  const [isOpen, setIsOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🧒')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const menuRef = useRef(null)

  // Fermer le menu au clic extérieur
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
        setShowForm(false)
        setConfirmDelete(null)
      }
    }
    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside)
    }
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [isOpen])

  function handleCreate(e) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    addProfile(trimmed, newEmoji)
    setNewName('')
    setNewEmoji('🧒')
    setShowForm(false)
    setIsOpen(false)
  }

  function handleDelete(id) {
    if (confirmDelete === id) {
      removeProfile(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
    }
  }

  function handleSelect(id) {
    setActiveProfile(id)
    setIsOpen(false)
    setConfirmDelete(null)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setShowForm(false); setConfirmDelete(null) }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
        aria-label="Sélectionner un profil"
      >
        <span>{activeProfile?.emoji ?? '👤'}</span>
        <span className="max-w-[80px] truncate">{activeProfile?.name ?? 'Profil'}</span>
        <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Liste des profils */}
          {profiles.length > 0 && (
            <ul className="py-1">
              {profiles.map((profile) => (
                <li key={profile.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <button
                    type="button"
                    onClick={() => handleSelect(profile.id)}
                    className={`flex-1 flex items-center gap-2 text-left text-sm rounded-lg px-2 py-1 transition-colors ${
                      activeProfile?.id === profile.id
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-semibold'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{profile.emoji}</span>
                    <span className="truncate">{profile.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(profile.id)}
                    className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                      confirmDelete === profile.id
                        ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                    }`}
                    title={confirmDelete === profile.id ? 'Confirmer la suppression' : 'Supprimer ce profil'}
                  >
                    {confirmDelete === profile.id ? 'Confirmer ?' : '✕'}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {profiles.length === 0 && !showForm && (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Aucun profil. Crée-en un !
            </p>
          )}

          {/* Formulaire de création */}
          {showForm ? (
            <form onSubmit={handleCreate} className="p-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Prénom de l'élève"
                maxLength={20}
                autoFocus
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewEmoji(emoji)}
                    className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-colors ${
                      newEmoji === emoji
                        ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 text-sm rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full px-4 py-3 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 border-t border-gray-100 dark:border-gray-700 transition-colors"
            >
              + Nouveau profil
            </button>
          )}
        </div>
      )}
    </div>
  )
}
