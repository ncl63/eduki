import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

function Preview({ id }) {
  if (id === 'letter-find') return <div className="letters"><span>b</span><b>a</b><span>d</span></div>
  if (id === 'letter-sound') return <div className="sounds"><Icon name="sound" /><span>a</span><i>ıııııı</i></div>
  if (id === 'word-recompose') return <div className="word">{'chat'.split('').map(letter => <span key={letter}>{letter}</span>)}</div>
  if (id === 'designation-shapes') return <div className="shape-preview"><i className="preview-circle" /><i className="preview-triangle" /><i className="preview-square" /></div>
  if (id === 'follow-dots') return <svg className="trace-preview" viewBox="0 0 180 100"><path d="M24 76 L90 24 L156 76" /><circle className="trace-preview-start" cx="24" cy="76" r="9" /><circle className="trace-preview-end" cx="156" cy="76" r="10" /></svg>
  return <div className="numbers"><span>3</span><div><i /><i /><i /></div></div>
}
export default function CarteExercice({ exercise }) {
  return <article className={`exercise-card ${exercise.tone}`}>
          <Link to={`/ex/${exercise.id}`} className="exercise-main"><div className="exercise-preview" aria-hidden="true"><Preview id={exercise.id} /></div><div className="card-copy"><span className="card-category">{exercise.skill}</span><h2>{exercise.titre}</h2><p>{exercise.description}</p><span className="card-start">Commencer <Icon name="arrow" /></span></div></Link>
          <div className="card-bottom"><span>{exercise.category}</span>{exercise.settingsPath
            ? <Link to={exercise.settingsPath} aria-label={`Réglages : ${exercise.titre}`}><Icon name="sliders" /> Réglages</Link>
            : <span className="card-ready">Prêt à tracer</span>}</div>
        </article>
}
