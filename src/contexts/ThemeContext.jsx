import { createContext, useContext, useEffect, useState } from 'react'
const ThemeContext = createContext()
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('ThemeProvider is required')
  return context
}
function initialTheme() {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') return saved === 'dark'
  } catch { /* Private storage can be unavailable; use the system preference. */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(initialTheme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light') }
    catch { /* The current theme still works for this session. */ }
  }, [isDark])
  return <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(value => !value) }}>{children}</ThemeContext.Provider>
}
