import { expect } from '@playwright/test'

export class BasePage {
  constructor(page) {
    this.page = page
  }

  async navigate(path = '/') {
    await this.page.goto(path)
    await this.page.waitForLoadState('networkidle')
  }

  async waitForNav() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(300)
  }

  // 保留向下兼容
  async waitForNavigation() {
    await this.waitForNav()
  }
}
