import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function sampleGuide(page, count = 64) {
  return page.getByTestId('tracing-guide').evaluate((path, sampleCount) => {
    const length = path.getTotalLength()
    const matrix = path.getScreenCTM()
    if (!matrix) return []
    return Array.from({ length: sampleCount }, (_, index) => {
      const point = path.getPointAtLength((length * index) / (sampleCount - 1))
      const screenPoint = new DOMPoint(point.x, point.y).matrixTransform(matrix)
      return { x: screenPoint.x, y: screenPoint.y }
    })
  }, count)
}

async function drawWithMouse(page, points) {
  await page.mouse.move(points[0].x, points[0].y)
  await page.mouse.down()
  for (const point of points.slice(1)) {
    await page.mouse.move(point.x, point.y)
  }
  await page.mouse.up()
}

test.beforeEach(async ({ page }) => {
  await page.goto('./#/ex/follow-dots')
  await expect(page.getByTestId('tracing-surface')).toBeVisible()
})

test('écran épuré, départ obligatoire et bouton recommencer', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await expect(page.getByRole('heading', { name: 'Suis les pointillés' })).toBeVisible()
  await expect(page.getByText('1 sur 7')).toBeVisible()
  await expect(page.getByRole('link', { name: /Accueil/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Recommencer', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: /Réglages/ })).toHaveCount(0)

  const surface = page.getByTestId('tracing-surface')
  const box = await surface.boundingBox()
  await page.mouse.move(box.x + 8, box.y + 8)
  await page.mouse.down()
  await page.mouse.move(box.x + 80, box.y + 30)
  await page.mouse.up()
  await expect(page.getByTestId('tracing-user-line')).toHaveCount(0)

  const points = await sampleGuide(page)
  await page.mouse.move(points[0].x, points[0].y)
  await page.mouse.down()
  for (const point of points.slice(1, 18)) await page.mouse.move(point.x, point.y)
  await page.mouse.up()
  await expect(page.getByText('Repars du point vert quand tu es prêt.')).toBeVisible()
  await expect(page.getByTestId('tracing-user-line')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('trace-en-cours.png'), fullPage: true })
  await page.getByRole('button', { name: 'Recommencer', exact: true }).click()
  await expect(page.getByTestId('tracing-user-line')).toHaveCount(0)
  await expect(page.getByText('Pose ton doigt sur le point vert, puis suis les pointillés.')).toBeVisible()
  expect(errors).toEqual([])
})

test('les sept tracés, jusqu’à la lettre M, se réussissent à la souris', async ({ page }, testInfo) => {
  const pathIds = []
  for (let index = 0; index < 7; index += 1) {
    pathIds.push(await page.getByTestId('tracing-surface').getAttribute('data-path-id'))
    if (index === 5) {
      await page.screenshot({ path: testInfo.outputPath('zigzag.png'), fullPage: true })
    }
    if (index === 6) {
      await expect(page.getByText('La lettre M')).toBeVisible()
      await page.screenshot({ path: testInfo.outputPath('lettre-m.png'), fullPage: true })
    }
    await drawWithMouse(page, await sampleGuide(page))
    await expect(page.getByText('Bravo ! Tu as suivi le chemin.')).toBeVisible()
    await expect(page.getByText(/Essaie encore|échec|erreur/i)).toHaveCount(0)
    await expect(page.getByText(/\d+\s*%/)).toHaveCount(0)
    const label = index === 6 ? 'Terminer' : 'Tracé suivant'
    if (index === 0) {
      await page.screenshot({ path: testInfo.outputPath('reussite.png'), fullPage: true })
    }
    await page.getByRole('button', { name: label }).click()
  }

  expect(pathIds.at(-1)).toBe('letter-m')
  expect(new Set(pathIds).size).toBe(7)
  await expect(page.getByTestId('tracing-complete')).toBeVisible()
  await expect(page.getByText('Tu as suivi tous les chemins et tracé la lettre M.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Recommencer le parcours' })).toBeVisible()
})

test('un lever bref permet de repartir simplement du début', async ({ page }) => {
  const points = await sampleGuide(page)
  await drawWithMouse(page, points.slice(0, 20))
  await expect(page.getByText('Repars du point vert quand tu es prêt.')).toBeVisible()
  await drawWithMouse(page, points)
  await expect(page.getByText('Bravo ! Tu as suivi le chemin.')).toBeVisible()
})

test('route directe, rechargement, contraste et propriétés anti-gestes parasites', async ({ page }) => {
  await page.reload()
  await expect(page.getByTestId('tracing-surface')).toBeVisible()
  const surface = page.getByTestId('tracing-surface')
  await expect(surface.locator('..')).toHaveCSS('touch-action', 'none')
  await expect(surface).toHaveCSS('touch-action', 'none')
  await expect(surface).toHaveCSS('user-select', 'none')
  expect(await page.evaluate(() => ({
    bodyOverflow: document.body.style.overflow,
    htmlOverflow: document.documentElement.style.overflow,
  }))).toEqual({ bodyOverflow: '', htmlOverflow: '' })
  expect((await new AxeBuilder({ page }).withRules(['color-contrast', 'link-name', 'button-name']).analyze()).violations).toEqual([])
  await page.getByRole('link', { name: /Accueil/ }).click()
  await expect(page.getByRole('heading', { name: 'Les exercices' })).toBeVisible()
})

test('geste tactile continu émulé au format iPad', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Le scénario tactile ne se joue qu’une fois.')
  await page.setViewportSize({ width: 834, height: 1112 })
  await page.reload()
  const points = await sampleGuide(page, 48)
  const session = await context.newCDPSession(page)
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...points[0], id: 1, radiusX: 22, radiusY: 22, force: 0.7 }],
  })
  for (const point of points.slice(1)) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ ...point, id: 1, radiusX: 22, radiusY: 22, force: 0.7 }],
    })
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect(page.getByText('Bravo ! Tu as suivi le chemin.')).toBeVisible()
  expect(await page.evaluate(() => ({ x: scrollX, y: scrollY, selection: getSelection()?.toString() }))).toEqual({ x: 0, y: 0, selection: '' })
})

test('mise en page vérifiée en portrait iPad et sur TNI', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Captures uniques sur le projet bureau.')
  for (const viewport of [
    { name: 'ipad-portrait', width: 834, height: 1112 },
    { name: 'tni-landscape', width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.reload()
    expect(await page.evaluate(() => ({
      horizontal: document.documentElement.scrollWidth <= innerWidth,
      vertical: document.documentElement.scrollHeight <= innerHeight,
    }))).toEqual({ horizontal: true, vertical: true })
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}.png`), fullPage: true })
  }
})
