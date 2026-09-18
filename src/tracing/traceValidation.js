const EPSILON = 1e-9
const DEFAULT_SAMPLE_SPACING = 24
const DEFAULT_TOLERANCE = 72
const MIN_ORDERED_COVERAGE = 0.78
const MIN_TRACE_LENGTH_RATIO = 0.62

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function isPoint(value) {
  return Boolean(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y)
}

function normalizedPoints(points) {
  if (!Array.isArray(points)) return []

  return points
    .filter(isPoint)
    .map(({ x, y }) => ({ x, y }))
}

function polylineLength(points) {
  let total = 0

  for (let index = 1; index < points.length; index += 1) {
    const segmentLength = distance(points[index - 1], points[index])
    if (Number.isFinite(segmentLength)) total += segmentLength
  }

  return total
}

function circleFrom(value, fallbackPoint, fallbackRadius) {
  if (isPoint(value)) {
    return {
      x: value.x,
      y: value.y,
      radius: isFiniteNumber(value.radius) && value.radius >= 0
        ? value.radius
        : fallbackRadius,
    }
  }

  if (!fallbackPoint) return null
  return { ...fallbackPoint, radius: fallbackRadius }
}

function nearestDistanceToPolyline(point, polyline) {
  if (!isPoint(point) || polyline.length === 0) return Number.POSITIVE_INFINITY
  if (polyline.length === 1) return distance(point, polyline[0])

  let nearest = Number.POSITIVE_INFINITY

  for (let index = 1; index < polyline.length; index += 1) {
    nearest = Math.min(
      nearest,
      distancePointToSegment(point, polyline[index - 1], polyline[index]),
    )
  }

  return nearest
}

function orderedCoverageFor(referenceSamples, traceSamples, tolerance) {
  if (referenceSamples.length === 0 || traceSamples.length === 0) return 0

  let nextTraceIndex = 0
  let matchedMilestones = 0

  for (const milestone of referenceSamples) {
    let matchingIndex = -1

    for (let index = nextTraceIndex; index < traceSamples.length; index += 1) {
      if (distance(milestone, traceSamples[index]) <= tolerance) {
        matchingIndex = index
        break
      }
    }

    if (matchingIndex >= 0) {
      matchedMilestones += 1
      // Un échantillon du geste ne valide qu'un jalon. Cette progression stricte
      // empêche un point immobile ou un raccourci de couvrir tout un parcours.
      nextTraceIndex = matchingIndex + 1
    }
  }

  return matchedMilestones / referenceSamples.length
}

export function distance(firstPoint, secondPoint) {
  if (!isPoint(firstPoint) || !isPoint(secondPoint)) {
    return Number.POSITIVE_INFINITY
  }

  return Math.hypot(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y)
}

export function distancePointToSegment(point, segmentStart, segmentEnd) {
  if (!isPoint(point) || !isPoint(segmentStart) || !isPoint(segmentEnd)) {
    return Number.POSITIVE_INFINITY
  }

  const segmentX = segmentEnd.x - segmentStart.x
  const segmentY = segmentEnd.y - segmentStart.y
  const squaredLength = (segmentX * segmentX) + (segmentY * segmentY)

  if (squaredLength <= EPSILON) return distance(point, segmentStart)

  const projection = (
    ((point.x - segmentStart.x) * segmentX)
    + ((point.y - segmentStart.y) * segmentY)
  ) / squaredLength
  const clampedProjection = Math.max(0, Math.min(1, projection))
  const nearestPoint = {
    x: segmentStart.x + (segmentX * clampedProjection),
    y: segmentStart.y + (segmentY * clampedProjection),
  }

  return distance(point, nearestPoint)
}

/**
 * Rééchantillonne une polyligne à intervalles réguliers et conserve toujours
 * ses deux extrémités. Les points dupliqués ou invalides ne provoquent pas de
 * division par zéro.
 */
export function samplePolyline(points, spacing = DEFAULT_SAMPLE_SPACING) {
  const cleanPoints = normalizedPoints(points)
  if (cleanPoints.length === 0) return []
  if (cleanPoints.length === 1) return [cleanPoints[0]]

  const safeSpacing = isFiniteNumber(spacing) && spacing > EPSILON
    ? spacing
    : DEFAULT_SAMPLE_SPACING
  const segments = []
  let totalLength = 0

  for (let index = 1; index < cleanPoints.length; index += 1) {
    const start = cleanPoints[index - 1]
    const end = cleanPoints[index]
    const length = distance(start, end)

    if (length <= EPSILON) continue

    segments.push({ start, end, length, offset: totalLength })
    totalLength += length
  }

  if (segments.length === 0) return [cleanPoints[0]]

  const samples = []
  let segmentIndex = 0

  for (let targetDistance = 0; targetDistance < totalLength; targetDistance += safeSpacing) {
    while (
      segmentIndex < segments.length - 1
      && targetDistance > segments[segmentIndex].offset + segments[segmentIndex].length
    ) {
      segmentIndex += 1
    }

    const segment = segments[segmentIndex]
    const progress = Math.max(
      0,
      Math.min(1, (targetDistance - segment.offset) / segment.length),
    )

    samples.push({
      x: segment.start.x + ((segment.end.x - segment.start.x) * progress),
      y: segment.start.y + ((segment.end.y - segment.start.y) * progress),
    })
  }

  const finalPoint = segments.at(-1).end
  if (distance(samples.at(-1), finalPoint) > EPSILON) {
    samples.push({ ...finalPoint })
  } else {
    samples[samples.length - 1] = { ...finalPoint }
  }

  return samples
}

export function isPointInCircle(point, circle) {
  if (!isPoint(point) || !isPoint(circle)) return false
  if (!isFiniteNumber(circle.radius) || circle.radius < 0) return false

  return distance(point, circle) <= circle.radius
}

/**
 * Évalue un geste sans dépendre du DOM ni du système d'entrée.
 *
 * La trajectoire de référence et le geste sont interpolés avant l'évaluation :
 * une souris ou un iPad qui émet peu d'événements ne crée donc pas de trous
 * artificiels. Les jalons doivent être rencontrés dans l'ordre, ce qui rejette
 * les lignes droites qui coupent une montagne, une vallée ou un zigzag.
 */
export function evaluateTrace({ tracePoints, path } = {}) {
  const pathPoints = normalizedPoints(path?.points)
  const cleanTracePoints = normalizedPoints(tracePoints)
  const tolerance = isFiniteNumber(path?.tolerance) && path.tolerance > 0
    ? path.tolerance
    : DEFAULT_TOLERANCE
  const start = circleFrom(path?.start, pathPoints[0], tolerance)
  const destination = circleFrom(path?.destination, pathPoints.at(-1), tolerance)

  const startedCorrectly = Boolean(
    start
    && cleanTracePoints.length > 0
    && isPointInCircle(cleanTracePoints[0], start),
  )
  // Une tablette peut regrouper les événements : le segment dessiné peut
  // traverser la cible sans qu'un échantillon brut tombe exactement dedans.
  const reachedDestination = Boolean(
    destination
    && nearestDistanceToPolyline(destination, cleanTracePoints) <= destination.radius,
  )

  const expectedLength = polylineLength(pathPoints)
  const traceLength = polylineLength(cleanTracePoints)
  const traceLengthRatio = expectedLength > EPSILON
    ? traceLength / expectedLength
    : 0

  if (pathPoints.length < 2 || expectedLength <= EPSILON || cleanTracePoints.length === 0) {
    return {
      success: false,
      startedCorrectly,
      reachedDestination,
      orderedCoverage: 0,
      traceLengthRatio,
      onPathRatio: 0,
    }
  }

  const milestoneSpacing = Math.max(18, Math.min(34, tolerance * 0.42))
  const gestureSpacing = Math.max(8, Math.min(18, milestoneSpacing / 2))
  const referenceSamples = samplePolyline(pathPoints, milestoneSpacing)
  const traceSamples = samplePolyline(cleanTracePoints, gestureSpacing)
  const orderedCoverage = orderedCoverageFor(
    referenceSamples,
    traceSamples,
    tolerance,
  )
  const onPathSamples = traceSamples.filter(
    (point) => nearestDistanceToPolyline(point, pathPoints) <= tolerance,
  ).length
  const onPathRatio = traceSamples.length > 0
    ? onPathSamples / traceSamples.length
    : 0
  const success = (
    startedCorrectly
    && reachedDestination
    && orderedCoverage >= MIN_ORDERED_COVERAGE
    && traceLengthRatio >= MIN_TRACE_LENGTH_RATIO
  )

  return {
    success,
    startedCorrectly,
    reachedDestination,
    orderedCoverage,
    traceLengthRatio,
    onPathRatio,
  }
}
