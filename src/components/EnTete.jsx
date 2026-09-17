import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext.jsx'
import Icon from './Icon.jsx'

export default function EnTete({ onHelp, onExercises }) {
  const { isDark, toggleTheme } = useTheme()
  return <header className="home-header">
      <Link className="brand" to="/" aria-label="Grafokwest, accueil"><span className="brand-symbol"><Icon name="book" /></span>Grafokwest<span className="brand-dot">.</span></Link>
      <nav aria-label="Navigation principale"><a href="#exercices" onClick={onExercises}>Les exercices</a><button type="button" onClick={onHelp}>Mode d’emploi</button></nav>
      <button className="icon-button" type="button" onClick={toggleTheme} aria-label={isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}><Icon name={isDark ? 'sun' : 'moon'} /></button>
    </header>
}
