export const TRACE_VIEW_BOX = Object.freeze({ width: 1000, height: 620 })

const START_RADIUS = 54
const DESTINATION_RADIUS = 54

/**
 * Premier lot de graphisme préparatoire au M.
 *
 * Les coordonnées sont exprimées dans TRACE_VIEW_BOX afin que l'interface
 * puisse adapter le dessin à l'écran sans modifier les données pédagogiques.
 */
export const TRACING_PACKS = Object.freeze({
  'oblique-pre-m': Object.freeze({
    id: 'oblique-pre-m',
    title: 'Suis les pointillés',
    completionMessage: 'Tu as suivi tous les chemins et tracé la lettre M.',
    paths: Object.freeze([
      Object.freeze({
        id: 'oblique-up-short',
        name: 'Oblique montante courte',
        difficulty: 1,
        points: Object.freeze([
          Object.freeze({ x: 270, y: 410 }),
          Object.freeze({ x: 730, y: 230 }),
        ]),
        start: Object.freeze({ x: 270, y: 410, radius: START_RADIUS }),
        destination: Object.freeze({ x: 730, y: 230, radius: DESTINATION_RADIUS }),
        visualWidth: 28,
        tolerance: 72,
      }),
      Object.freeze({
        id: 'oblique-down-short',
        name: 'Oblique descendante courte',
        difficulty: 1,
        points: Object.freeze([
          Object.freeze({ x: 270, y: 220 }),
          Object.freeze({ x: 730, y: 400 }),
        ]),
        start: Object.freeze({ x: 270, y: 220, radius: START_RADIUS }),
        destination: Object.freeze({ x: 730, y: 400, radius: DESTINATION_RADIUS }),
        visualWidth: 28,
        tolerance: 72,
      }),
      Object.freeze({
        id: 'oblique-up-long',
        name: 'Oblique montante longue',
        difficulty: 2,
        points: Object.freeze([
          Object.freeze({ x: 150, y: 470 }),
          Object.freeze({ x: 850, y: 160 }),
        ]),
        start: Object.freeze({ x: 150, y: 470, radius: START_RADIUS }),
        destination: Object.freeze({ x: 850, y: 160, radius: DESTINATION_RADIUS }),
        visualWidth: 28,
        tolerance: 74,
      }),
      Object.freeze({
        id: 'mountain',
        name: 'La montagne',
        difficulty: 3,
        points: Object.freeze([
          Object.freeze({ x: 135, y: 485 }),
          Object.freeze({ x: 500, y: 115 }),
          Object.freeze({ x: 865, y: 485 }),
        ]),
        start: Object.freeze({ x: 135, y: 485, radius: START_RADIUS }),
        destination: Object.freeze({ x: 865, y: 485, radius: DESTINATION_RADIUS }),
        visualWidth: 28,
        tolerance: 76,
      }),
      Object.freeze({
        id: 'valley',
        name: 'La vallée',
        difficulty: 3,
        points: Object.freeze([
          Object.freeze({ x: 135, y: 135 }),
          Object.freeze({ x: 500, y: 505 }),
          Object.freeze({ x: 865, y: 135 }),
        ]),
        start: Object.freeze({ x: 135, y: 135, radius: START_RADIUS }),
        destination: Object.freeze({ x: 865, y: 135, radius: DESTINATION_RADIUS }),
        visualWidth: 28,
        tolerance: 76,
      }),
      Object.freeze({
        id: 'pre-m-zigzag',
        name: 'Petit zigzag préparatoire au M',
        difficulty: 4,
        points: Object.freeze([
          Object.freeze({ x: 160, y: 430 }),
          Object.freeze({ x: 380, y: 190 }),
          Object.freeze({ x: 610, y: 430 }),
          Object.freeze({ x: 840, y: 190 }),
        ]),
        start: Object.freeze({ x: 160, y: 430, radius: START_RADIUS }),
        destination: Object.freeze({ x: 840, y: 190, radius: DESTINATION_RADIUS }),
        visualWidth: 28,
        tolerance: 78,
      }),
      Object.freeze({
        id: 'letter-m',
        name: 'La lettre M',
        difficulty: 5,
        points: Object.freeze([
          Object.freeze({ x: 180, y: 470 }),
          Object.freeze({ x: 180, y: 150 }),
          Object.freeze({ x: 500, y: 390 }),
          Object.freeze({ x: 820, y: 150 }),
          Object.freeze({ x: 820, y: 470 }),
        ]),
        start: Object.freeze({ x: 180, y: 470, radius: START_RADIUS }),
        destination: Object.freeze({ x: 820, y: 470, radius: DESTINATION_RADIUS }),
        visualWidth: 28,
        tolerance: 76,
      }),
    ]),
  }),
})

export function getTracingPack(id) {
  return TRACING_PACKS[id] ?? null
}
