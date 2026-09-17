import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const settingsRoutes = ['letters', 'letter-sound', 'quantity-sound', 'words', 'designation/simple-shapes']
test('réglages lisibles en clair et en sombre', async ({ page }, testInfo) => {
  for (const theme of ['light', 'dark']) {
    await page.addInitScript(value => localStorage.setItem('theme', value), theme)
    for (const route of settingsRoutes) {
      await page.goto('./#/settings/' + route)
      await expect(page.locator('.settings-page')).toBeVisible()
      const analysis = await new AxeBuilder({ page }).withRules(['color-contrast', 'label', 'select-name', 'button-name']).analyze()
      expect(analysis.violations).toEqual([])
      await page.screenshot({ path: testInfo.outputPath(theme + '-' + route + '.png'), fullPage: true })
    }
  }
})

test('lettre cible : réglages, sauvegarde et réinitialisation', async ({ page }) => {
  await page.goto('./#/settings/letters')
  await page.getByLabel('Lettre cible', { exact: true }).fill('Z')
  await page.getByLabel('Style de lettres', { exact: true }).selectOption('script')
  await page.reload()
  await expect(page.getByLabel('Lettre cible', { exact: true })).toHaveValue('Z')
  await expect(page.getByLabel('Style de lettres', { exact: true })).toHaveValue('script')
  await page.getByRole('link', { name: /Retour au jeu/ }).click()
  await expect(page.locator('header').getByText('z', { exact: true })).toBeVisible()
  const target = page.locator('header [style]').filter({ hasText: /^z$/ }).first()
  await expect(target).toHaveCSS('font-family', /Belle Allure/)
  await page.getByRole('link', { name: /Réglages/ }).click()
  await page.getByRole('button', { name: 'Réinitialiser' }).click()
  await expect(page.getByLabel('Lettre cible', { exact: true })).toHaveValue('A')
  await expect(page.getByLabel('Style de lettres', { exact: true })).toHaveValue('baton')
})

test('lettres entendues : sélection et nombre de réponses conservés', async ({ page }) => {
  await page.goto('./#/settings/letter-sound')
  await page.getByRole('button', { name: 'A', exact: true }).click()
  await expect(page.getByRole('button', { name: 'A', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('slider', { name: 'Nombre de lettres proposées' }).fill('4')
  await page.getByLabel('Style de lettres', { exact: true }).selectOption('mixte')
  await page.reload()
  await expect(page.getByRole('button', { name: 'A', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('slider')).toHaveValue('4')
  await page.getByRole('link', { name: /Retour au jeu/ }).click()
  await expect(page.locator('main button')).toHaveCount(4)
  await expect(page.locator('main button').first().locator('[style]')).toHaveCount(2)
})

test('nombres : affichages dés et chiffres conservés', async ({ page }) => {
  await page.goto('./#/settings/quantity-sound')
  await page.getByRole('radio', { name: /Chiffres numériques/ }).click()
  await page.reload()
  await expect(page.getByRole('radio', { name: /Chiffres numériques/ })).toHaveAttribute('aria-checked', 'true')
  await page.getByRole('link', { name: /Retour au jeu/ }).click()
  await expect(page.getByRole('button', { name: /^Chiffre / })).toHaveCount(6)
  await page.getByRole('link', { name: /Réglages/ }).click()
  await page.getByRole('button', { name: 'Réinitialiser' }).click()
  await page.getByRole('link', { name: /Retour au jeu/ }).click()
  await expect(page.getByRole('button', { name: /^Face de dé / })).toHaveCount(6)
})

test('mots : contenu personnalisé et réponse complète', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('./#/settings/words')
  await page.getByLabel(/Liste des mots/).fill('CHAT')
  await page.reload()
  await expect(page.getByLabel(/Liste des mots/)).toHaveValue('CHAT')
  await page.getByRole('link', { name: /Retour au jeu/ }).click()
  for (const letter of 'CHAT') await page.locator('main').getByRole('button', { name: letter, exact: true }).click()
  await expect(page.getByText('Bravo !', { exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('désignation : difficulté, contenus actifs et réponse', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.01 })
  await page.goto('./#/settings/designation/simple-shapes')
  await expect(page.getByRole('slider', { name: /Nombre de choix/ })).toHaveValue('2')
  await page.getByRole('slider', { name: /Nombre de choix/ }).fill('3')
  await page.getByRole('button', { name: 'Rectangle', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('slider', { name: /Nombre de choix/ })).toHaveValue('3')
  await expect(page.getByRole('button', { name: 'Rectangle', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('link', { name: /Retour au jeu/ }).click()
  await expect(page.locator('main button')).toHaveCount(3)
  await page.getByRole('button', { name: 'Cercle', exact: true }).click()
  await expect(page.getByText('Bravo !', { exact: true })).toBeVisible()
})

test('retours erreur et réussite toujours distincts', async ({ page }, testInfo) => {
  await page.addInitScript(() => { Math.random = () => 0.01; localStorage.setItem('theme', 'dark') })
  await page.goto('./#/ex/quantity-sound')
  await page.getByRole('button', { name: 'Face de dé 2', exact: true }).click()
  await expect(page.getByText('Essaie encore.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Face de dé 2', exact: true })).toHaveClass(/ui-error-surface/)
  await page.getByRole('button', { name: 'Face de dé 1', exact: true }).click()
  await expect(page.getByText('Bravo !', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Face de dé 1', exact: true })).toHaveClass(/ui-success-surface/)
  await page.screenshot({ path: testInfo.outputPath('feedback.png') })
})

test('exercices : contraste, commandes et polices conservées', async ({ page }, testInfo) => {
  for (const theme of ['light', 'dark']) {
    await page.addInitScript(value => localStorage.setItem('theme', value), theme)
    for (const route of ['letter-find', 'letter-sound', 'quantity-sound', 'word-recompose', 'designation-shapes']) {
      await page.goto('./#/ex/' + route)
      await expect(page.locator('.activity-page')).toBeVisible()
      await expect(page.getByRole('link', { name: /Accueil/ })).toBeVisible()
      await expect(page.getByRole('link', { name: /Réglages/ })).toBeVisible()
      expect((await new AxeBuilder({ page }).withRules(['color-contrast', 'button-name']).analyze()).violations).toEqual([])
      await page.screenshot({ path: testInfo.outputPath(theme + '-' + route + '.png'), fullPage: true })
    }
  }
})


test('exercices de lettres : réponses et victoire conservées', async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.01
    localStorage.setItem('settings_letter_sound_v1', JSON.stringify({enabledLetters:['A','B'],choicesPerRound:2,letterStyle:'baton'}))
    localStorage.setItem('settings_letters_v1', JSON.stringify({targetLetter:'A',distractorLetters:'B',itemsCount:8,targetRatio:0.1,letterStyle:'baton'}))
  })
  await page.goto('./#/ex/letter-sound')
  await page.locator('main').getByRole('button', { name: 'A', exact: true }).click()
  await expect(page.getByText('Essaie encore.', { exact: true })).toBeVisible()
  await page.locator('main').getByRole('button', { name: 'B', exact: true }).click()
  await expect(page.getByText('Bravo !', { exact: true })).toBeVisible()
  await page.evaluate(() => { let seed = 73; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 } })
  await page.goto('./#/ex/letter-find')
  await page.locator('main').getByRole('button', { name: 'A', exact: true }).click()
  await expect(page.getByText('Bravo ! ⭐', { exact: true })).toBeVisible()
  await expect(page.getByText('1 / 10 ⭐', { exact: true })).toBeVisible()
})
