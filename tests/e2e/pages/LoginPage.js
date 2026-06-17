import { expect } from '@playwright/test'
import { BasePage } from './BasePage.js'

export class LoginPage extends BasePage {
  constructor(page) {
    super(page)
    this.usernameInput = page.locator('#username')
    this.passwordInput = page.locator('#password')
    this.submitButton = page.locator('button[type="submit"]')
    this.errorMsg = page.locator('.error')
  }

  async goto() {
    await this.navigate('/login')
  }

  async login(username, password) {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async assertLoginSuccess() {
    // 导航栏出现"退出登录"即表示登录+跳转首页成功
    await expect(this.page.locator('nav')).toContainText('退出登录', { timeout: 10000 })
  }
}
