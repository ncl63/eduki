import circleImage from '../designation/shapes/circle.svg'
import squareImage from '../designation/shapes/square.svg'
import triangleImage from '../designation/shapes/triangle.svg'
import rectangleImage from '../designation/shapes/rectangle.svg'

/**
 * Un lot de désignation ne contient que ses contenus.
 * Le moteur accepte une consigne enregistrée (audioSrc) ou utilise speechSynthesis
 * avec prompt.speech en solution de repli.
 */
export const DESIGNATION_SETS = {
  'simple-shapes': {
    id: 'simple-shapes',
    title: 'Montre la forme',
    instruction: 'Écoute puis touche la bonne forme.',
    items: [
      {
        id: 'circle',
        label: 'Cercle',
        image: { src: circleImage, alt: 'Un cercle' },
        prompt: { text: 'Montre le cercle.', speech: 'Montre le cercle.' },
      },
      {
        id: 'square',
        label: 'Carré',
        image: { src: squareImage, alt: 'Un carré' },
        prompt: { text: 'Montre le carré.', speech: 'Montre le carré.' },
      },
      {
        id: 'triangle',
        label: 'Triangle',
        image: { src: triangleImage, alt: 'Un triangle' },
        prompt: { text: 'Montre le triangle.', speech: 'Montre le triangle.' },
      },
      {
        id: 'rectangle',
        label: 'Rectangle',
        image: { src: rectangleImage, alt: 'Un rectangle' },
        prompt: { text: 'Montre le rectangle.', speech: 'Montre le rectangle.' },
      },
    ],
  },
}

export function getDesignationSet(id) {
  return DESIGNATION_SETS[id] ?? null
}
