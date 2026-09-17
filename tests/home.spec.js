import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('accueil, filtres et navigation sans profils', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Les exercices')
  await expect(page.locator('.exercise-card')).toHaveCount(4)
  await expect(page.getByText(/profil/i)).toHaveCount(0)
  await page.getByRole('button', { name: 'Lettres', exact: true }).click()
  await expect(page.locator('.exercise-card')).toHaveCount(2)
  await page.getByRole('button', { name: 'Mots', exact: true }).click()
  await expect(page.locator('.exercise-card')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Recompose le mot' })).toBeVisible()
  await page.getByRole('button', { name: 'Nombres', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Écoute le nombre' })).toBeVisible()
  await page.getByRole('button', { name: 'Tout voir' }).click()
  await expect(page.locator('.exercise-card')).toHaveCount(4)
  await expect(page.locator('.exercise-card').first()).toBeInViewport()
  expect(errors).toEqual([])
})

test('dialogue accessible et fermeture au clavier', async ({ page }) => {
  await page.goto('./')
  const trigger = page.getByRole('button', { name: 'Mode d’emploi', exact: true })
  await trigger.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(trigger).toBeFocused()
})

test('thèmes persistants, contraste et absence de débordement', async ({ page }, testInfo) => {
  await page.goto('./')
  for (const theme of ['clair', 'sombre']) {
    if (theme === 'sombre') await page.getByRole('button', { name: 'Activer le thème sombre' }).click()
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(theme + '.png'), fullPage: true })
  }
  await page.reload()
  await expect(page.locator('html')).toHaveClass('dark')
})

const routes = [
  ['letter-find', 'letters'],
  ['letter-sound', 'letter-sound'],
  ['quantity-sound', 'quantity-sound'],
  ['word-recompose', 'words'],
]
for (const [exercise, settings] of routes) {
  test('exercice et réglages : ' + exercise, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('./')
    await page.locator('a[href="#/ex/' + exercise + '"]').click()
    await expect(page.getByRole('link', { name: /Accueil/ })).toBeVisible()
    await expect(page.getByText('Chargement de l’exercice…')).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    await expect(page.getByText("Oups, quelque chose s'est mal passé.")).toHaveCount(0)
    await page.reload()
    await expect(page.getByRole('link', { name: /Accueil/ })).toBeVisible()
    await page.goto('./#/settings/' + settings)
    await expect(page.getByRole('link', { name: /Accueil/ })).toBeVisible()
    await expect(page.locator('input, select, [role=radio]').first()).toBeVisible()
    expect(errors).toEqual([])
  })
}

test('stockage indisponible et page inconnue', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Unavailable', 'SecurityError') }
    Storage.prototype.setItem = () => { throw new DOMException('Unavailable', 'SecurityError') }
  })
  await page.goto('./')
  await expect(page.locator('.exercise-card')).toHaveCount(4)
  await page.getByRole('button', { name: 'Activer le thème sombre' }).click()
  await expect(page.locator('html')).toHaveClass('dark')
  await page.goto('./#/inconnue')
  await expect(page.getByRole('heading', { name: 'Cette page n’existe pas.' })).toBeVisible()
  await page.getByRole('link', { name: 'Retour aux exercices' }).click()
  await expect(page.locator('.exercise-card')).toHaveCount(4)
})

test('navigation clavier depuis le lien d’évitement', async ({ page }) => {
  await page.goto('./')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Aller aux exercices' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#exercices')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Tout voir' })).toBeFocused()
})


test('petits écrans et tablette sans contenu tronqué', async ({ page }) => {
  await page.goto('./')
  for (const width of [320, 375, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(page.getByRole('button', { name: 'Comment ça marche' })).toBeVisible()
  }
})

test('Grafokwest et catégorie Désignation vide', async ({ page }, testInfo) => {
  await page.goto('./')
  await expect(page).toHaveTitle('Grafokwest — Apprendre, simplement')
  await expect(page.getByRole('link', { name: 'Grafokwest, accueil' })).toBeVisible()
  await page.getByRole('button', { name: 'Désignation', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Désignation', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.exercise-card')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Aucun exercice pour le moment' })).toBeVisible()
  await expect(page.getByRole('status')).toHaveText('0 exercice affiché')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.screenshot({ path: testInfo.outputPath('designation.png'), fullPage: true })
  await page.getByRole('button', { name: 'Tout voir' }).click()
  await expect(page.locator('.exercise-card')).toHaveCount(4)
})
