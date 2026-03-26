import React, { createContext, useContext, useCallback, useState } from 'react'
import { loadJSON, saveJSON } from '../utils/storage.js'
import { clearResults } from '../utils/tracking.js'

const ProfileContext = createContext()

const PROFILES_KEY = 'eduki_profiles'
const ACTIVE_KEY = 'eduki_active_profile'

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState(() => loadJSON(PROFILES_KEY, []))
  const [activeProfileId, setActiveProfileId] = useState(() => loadJSON(ACTIVE_KEY, null))

  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null

  const persistProfiles = useCallback((next) => {
    setProfiles(next)
    saveJSON(PROFILES_KEY, next)
  }, [])

  const setActiveProfile = useCallback((id) => {
    setActiveProfileId(id)
    saveJSON(ACTIVE_KEY, id)
  }, [])

  const addProfile = useCallback((name, emoji) => {
    const profile = {
      id: generateId(),
      name: name.trim(),
      emoji: emoji || '🧒',
      createdAt: new Date().toISOString(),
    }
    const next = [...profiles, profile]
    persistProfiles(next)
    setActiveProfile(profile.id)
    return profile
  }, [profiles, persistProfiles, setActiveProfile])

  const removeProfile = useCallback((id) => {
    const next = profiles.filter((p) => p.id !== id)
    persistProfiles(next)
    clearResults(id)
    if (activeProfileId === id) {
      setActiveProfile(null)
    }
  }, [profiles, activeProfileId, persistProfiles, setActiveProfile])

  return (
    <ProfileContext.Provider
      value={{ profiles, activeProfile, setActiveProfile, addProfile, removeProfile }}
    >
      {children}
    </ProfileContext.Provider>
  )
}
