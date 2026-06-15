import { expect } from '@playwright/test'

export async function loginAsUser(page, username, password) {
  await page.goto('/login')
  await page.fill('#username', username)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
}

export async function loginAsAdmin(page) {
  await loginAsUser(page, 'dzr', '123456')
}

export async function logout(page) {
  const logoutLink = page.locator('a:has-text("退出登录")')
  if (await logoutLink.isVisible()) {
    await logoutLink.click()
    await page.waitForURL('/login')
  }
}

export async function clearLocalStorage(page) {
  await page.evaluate(() => localStorage.clear())
}

export async function setUserInLocalStorage(page, user) {
  await page.evaluate((u) => {
    localStorage.setItem('user', JSON.stringify(u))
  }, user)
}

export async function waitForToast(page) {
  const alert = page.locator('.alert, [role="alert"], .success-message')
  if (await alert.isVisible({ timeout: 3000 }).catch(() => false)) {
    return alert.textContent()
  }
  return null
}

export function generateUniqueUsername(prefix = 'testuser') {
  return `${prefix}_${Date.now()}`
}

export function getCurrentTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

export async function assertPageTitle(page, expectedTitle) {
  await expect(page.locator('h1, h2')).toContainText(expectedTitle)
}

export async function assertSuccessMessage(page, message) {
  await expect(page.locator('.success, .success-message, .alert-success')).toContainText(message, { timeout: 5000 })
}

export async function assertErrorMessage(page, message) {
  await expect(page.locator('.error, .error-message, .alert-danger')).toContainText(message, { timeout: 5000 })
}
