import { expect } from '@playwright/test'
import { BasePage } from './BasePage.js'

export class LoginPage extends BasePage {
  constructor(page) {
    super(page)
    this.usernameInput = page.locator('#username')
    this.passwordInput = page.locator('#password')
    this.submitButton = page.locator('button[type="submit"]')
    this.errorMsg = page.locator('.error')
    this.registerLink = page.locator('a[href="/register"]')
  }

  async goto() {
    await this.navigate('/login')
  }

  async login(username, password) {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
    await this.waitForNavigation()
  }

  async assertLoginSuccess() {
    await expect(this.page).toHaveURL('/')
    await expect(this.page.locator('nav')).toContainText('退出登录')
  }

  async assertLoginError(expectedError) {
    await expect(this.errorMsg).toBeVisible()
    await expect(this.errorMsg).toContainText(expectedError)
  }

  async assertLoginPageVisible() {
    await expect(this.page.locator('h2')).toContainText('用户登录')
    await expect(this.usernameInput).toBeVisible()
    await expect(this.passwordInput).toBeVisible()
  }

  async clickRegister() {
    await this.registerLink.click()
    await this.waitForNavigation()
  }
}
