import EnTete from '../components/EnTete.jsx'
import CarteExercice from '../components/CarteExercice.jsx'
import { useRef, useState } from 'react'
import { EXERCISES } from '../data/exercises.js'
import Icon from '../components/Icon.jsx'

const categories = ['Tout voir', 'Lettres', 'Mots', 'Nombres', 'Désignation']
function goToExercises(event) {
  event.preventDefault()
  const section = document.getElementById('exercices')
  section.focus()
  section.scrollIntoView()
}
export default function Home() {
  const [category, setCategory] = useState('Tout voir')
  const help = useRef(null)
  const exercises = EXERCISES.filter(item => category === 'Tout voir' || item.category === category)
  return <div className="home-shell">
    <a className="skip-link" href="#exercices" onClick={goToExercises}>Aller aux exercices</a>
    <EnTete onHelp={() => help.current.showModal()} onExercises={goToExercises} />
    <main className="home-main">
      <section id="exercices" className="exercise-section" tabIndex={-1} aria-labelledby="exercises-title">
        <div className="section-heading"><div><p className="eyebrow">À VOUS DE CHOISIR</p><h1 id="exercises-title">Les exercices</h1></div><span>Un objectif. Toute votre attention.</span></div>
        <div className="filters" role="group" aria-label="Filtrer les exercices">{categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}{item === 'Tout voir' && <span>{EXERCISES.length}</span>}</button>)}</div>
        <p className="sr-only" role="status">{exercises.length} exercice{exercises.length > 1 ? 's' : ''} affiché{exercises.length > 1 ? 's' : ''}</p>
        <div className="exercise-grid">{exercises.length > 0
          ? exercises.map(exercise => <CarteExercice key={exercise.id} exercise={exercise} />)
          : <div className="empty-category"><Icon name="book" /><h2>Aucun exercice pour le moment</h2><p>Les exercices de désignation seront ajoutés ici prochainement.</p></div>}
        </div>
      </section>
      <aside className="guide-strip"><div className="guide-icon"><Icon name="sliders" /></div><div><h2>Un exercice qui s’adapte à vous.</h2><p>Lettres, difficulté, affichage… ajustez les réglages avant de commencer.</p></div><button type="button" onClick={() => help.current.showModal()}>Comment ça marche <Icon name="arrow" /></button></aside>
    </main>
    <footer className="home-footer"><span className="footer-brand">Grafokwest<span>.</span></span><p>Apprendre, un exercice à la fois.</p><span>Lettres, mots & nombres</span></footer>
    <dialog className="help-dialog" ref={help} aria-labelledby="help-title" onClick={event => { if (event.target === help.current) help.current.close() }}>
      <div className="dialog-heading"><span className="eyebrow">PRENDRE LE TEMPS D’APPRENDRE</span><button className="icon-button" type="button" aria-label="Fermer le mode d’emploi" onClick={() => help.current.close()}><Icon name="close" /></button></div>
      <h2 id="help-title">Tout commence par un exercice.</h2>
      <ol><li><strong>Choisissez ce que vous souhaitez travailler.</strong><p>Les lettres, les sons, les mots ou les nombres : chaque exercice a un objectif précis.</p></li><li><strong>Ajustez les réglages.</strong><p>Le lien « Réglages » de chaque carte permet d’adapter le contenu et l’affichage.</p></li><li><strong>Commencez à votre rythme.</strong><p>Aucun compte à créer. Pour les activités d’écoute, activez le son de votre appareil.</p></li></ol>
      <button className="primary-action" type="button" onClick={() => help.current.close()}>C’est parti <Icon name="arrow" /></button>
    </dialog>
  </div>
}
