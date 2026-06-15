import { expect } from '@playwright/test'
import { BasePage } from './BasePage.js'

export class RegisterPage extends BasePage {
  constructor(page) {
    super(page)
    this.usernameInput = page.locator('#username')
    this.emailInput = page.locator('#email')
    this.passwordInput = page.locator('#password')
    this.confirmPasswordInput = page.locator('#confirmPassword')
    this.submitButton = page.locator('button[type="submit"]')
    this.errorMsg = page.locator('.error')
    this.successMsg = page.locator('.success')
  }

  async goto() {
    await this.navigate('/register')
  }

  async register(username, email, password, confirmPassword) {
    await this.usernameInput.fill(username)
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.confirmPasswordInput.fill(confirmPassword || password)
    await this.submitButton.click()
    await this.waitForNavigation()
  }

  async assertRegisterPageVisible() {
    await expect(this.page.locator('h2')).toContainText('用户注册')
  }

  async assertRegisterSuccess() {
    await expect(this.page).toHaveURL('/login')
  }

  async assertRegisterError(expectedError) {
    await expect(this.errorMsg).toBeVisible()
    await expect(this.errorMsg).toContainText(expectedError)
  }
}
