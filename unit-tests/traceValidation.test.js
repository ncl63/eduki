import test from 'node:test'
import assert from 'node:assert/strict'

import {
  TRACE_VIEW_BOX,
  TRACING_PACKS,
  getTracingPack,
} from '../src/data/tracingPaths.js'
import {
  distance,
  distancePointToSegment,
  evaluateTrace,
  isPointInCircle,
  samplePolyline,
} from '../src/tracing/traceValidation.js'

const pack = getTracingPack('oblique-pre-m')

test('le pack expose sept parcours valides et leurs extrémités explicites', () => {
  assert.deepEqual(TRACE_VIEW_BOX, { width: 1000, height: 620 })
  assert.equal(TRACING_PACKS['oblique-pre-m'], pack)
  assert.equal(pack.title, 'Suis les pointillés')
  assert.equal(pack.completionMessage, 'Tu as suivi tous les chemins et tracé la lettre M.')
  assert.equal(pack.paths.length, 7)
  assert.equal(new Set(pack.paths.map(({ id }) => id)).size, 7)

  for (const path of pack.paths) {
    assert.ok(path.id)
    assert.ok(path.name)
    assert.ok(Number.isFinite(path.difficulty))
    assert.ok(path.points.length >= 2)
    assert.ok(path.visualWidth > 0)
    assert.ok(path.tolerance >= path.visualWidth)

    const firstPoint = path.points[0]
    const finalPoint = path.points.at(-1)
    assert.deepEqual(
      { x: path.start.x, y: path.start.y },
      firstPoint,
      `${path.id}: le départ correspond à la première extrémité`,
    )
    assert.deepEqual(
      { x: path.destination.x, y: path.destination.y },
      finalPoint,
      `${path.id}: l'arrivée correspond à la dernière extrémité`,
    )
    assert.ok(path.start.radius > 0)
    assert.ok(path.destination.radius > 0)
  }

  const shortDescent = pack.paths.find(({ id }) => id === 'oblique-down-short')
  const mountain = pack.paths.find(({ id }) => id === 'mountain')
  const valley = pack.paths.find(({ id }) => id === 'valley')
  const shortDescentLength = distance(...shortDescent.points)
  assert.ok(distance(mountain.points[1], mountain.points[2]) > shortDescentLength)
  assert.ok(distance(valley.points[0], valley.points[1]) > shortDescentLength)

  assert.equal(getTracingPack('inconnu'), null)
})

test('les primitives géométriques restent robustes sur les segments nuls', () => {
  assert.equal(distance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5)
  assert.equal(
    distancePointToSegment(
      { x: 3, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ),
    5,
  )
  assert.equal(isPointInCircle({ x: 3, y: 4 }, { x: 0, y: 0, radius: 5 }), true)
  assert.equal(isPointInCircle(null, { x: 0, y: 0, radius: 5 }), false)

  const samples = samplePolyline([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ], 4)
  assert.deepEqual(samples, [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 8, y: 0 },
    { x: 10, y: 0 },
  ])
})

test('un bon suivi légèrement imprécis est accepté', () => {
  const path = pack.paths.find(({ id }) => id === 'oblique-up-long')
  const result = evaluateTrace({
    path,
    tracePoints: [
      path.start,
      { x: 320, y: 413 },
      { x: 500, y: 335 },
      { x: 680, y: 247 },
      path.destination,
    ],
  })

  assert.equal(result.startedCorrectly, true)
  assert.equal(result.reachedDestination, true)
  assert.ok(result.orderedCoverage >= 0.78)
  assert.equal(result.success, true)
})

test('un bref écart hors de la zone centrale ne provoque pas un échec', () => {
  const path = pack.paths.find(({ id }) => id === 'oblique-up-short')
  const result = evaluateTrace({
    path,
    tracePoints: [
      path.start,
      { x: 390, y: 363 },
      { x: 500, y: 410 },
      { x: 590, y: 285 },
      path.destination,
    ],
  })

  assert.equal(result.success, true)
  assert.ok(result.onPathRatio < 1)
})

test('un geste qui ne commence pas au départ est refusé', () => {
  const path = pack.paths.find(({ id }) => id === 'oblique-down-short')
  const result = evaluateTrace({
    path,
    tracePoints: [
      { x: 420, y: 280 },
      { x: 560, y: 335 },
      path.destination,
    ],
  })

  assert.equal(result.startedCorrectly, false)
  assert.equal(result.reachedDestination, true)
  assert.equal(result.success, false)
})

test('atteindre seulement la destination ne suffit pas', () => {
  const path = pack.paths.find(({ id }) => id === 'mountain')
  const result = evaluateTrace({ tracePoints: [path.destination], path })

  assert.equal(result.reachedDestination, true)
  assert.equal(result.startedCorrectly, false)
  assert.equal(result.traceLengthRatio, 0)
  assert.equal(result.success, false)
})

test('une cible traversée entre deux événements tactiles est détectée', () => {
  const path = pack.paths.find(({ id }) => id === 'oblique-up-short')
  const result = evaluateTrace({
    path,
    tracePoints: [
      path.start,
      { x: 650, y: 261 },
      { x: 805, y: 201 },
    ],
  })

  assert.equal(result.reachedDestination, true)
})

test('les raccourcis de la montagne et du zigzag sont refusés', () => {
  for (const id of ['mountain', 'pre-m-zigzag']) {
    const path = pack.paths.find((candidate) => candidate.id === id)
    const result = evaluateTrace({
      path,
      tracePoints: [path.start, path.destination],
    })

    assert.equal(result.startedCorrectly, true)
    assert.equal(result.reachedDestination, true)
    assert.ok(result.orderedCoverage < 0.78, id)
    assert.equal(result.success, false, id)
  }
})

test('les points dupliqués ne rendent pas les métriques non finies', () => {
  const source = pack.paths.find(({ id }) => id === 'oblique-up-short')
  const path = {
    ...source,
    points: [source.points[0], source.points[0], source.points[1]],
  }
  const result = evaluateTrace({
    path,
    tracePoints: [path.start, path.start, path.destination, path.destination],
  })

  assert.equal(result.success, true)
  assert.ok(Number.isFinite(result.orderedCoverage))
  assert.ok(Number.isFinite(result.traceLengthRatio))
})

test('le tracé final est la lettre M et se réussit en quatre segments', () => {
  const mPath = pack.paths.at(-1)

  assert.equal(mPath.id, 'letter-m')
  assert.equal(mPath.name, 'La lettre M')
  assert.deepEqual(mPath.points, [
    { x: 180, y: 470 },
    { x: 180, y: 150 },
    { x: 500, y: 390 },
    { x: 820, y: 150 },
    { x: 820, y: 470 },
  ])

  const result = evaluateTrace({
    path: mPath,
    tracePoints: mPath.points,
  })

  assert.equal(result.startedCorrectly, true)
  assert.equal(result.reachedDestination, true)
  assert.equal(result.success, true)
})

test('une polyligne de référence entièrement nulle échoue sans exception', () => {
  const zeroPath = {
    points: [{ x: 10, y: 10 }, { x: 10, y: 10 }],
    start: { x: 10, y: 10, radius: 20 },
    destination: { x: 10, y: 10, radius: 20 },
    tolerance: 40,
  }
  const result = evaluateTrace({
    path: zeroPath,
    tracePoints: [{ x: 10, y: 10 }, { x: 10, y: 10 }],
  })

  assert.equal(result.success, false)
  assert.equal(result.orderedCoverage, 0)
  assert.equal(result.traceLengthRatio, 0)
})
