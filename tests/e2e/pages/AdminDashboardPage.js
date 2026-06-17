import { expect } from '@playwright/test'
import { BasePage } from './BasePage.js'

export class AdminDashboardPage extends BasePage {
  constructor(page) {
    super(page)
    this.pageTitle = page.locator('h2')
    this.statCards = page.locator('.stat-card')
  }

  async goto() {
    await this.navigate('/admin/dashboard')
  }

  async assertDashboardVisible() {
    await expect(this.pageTitle).toContainText('数据仪表盘')
  }

  async getStatCardValues() {
    const cards = this.statCards
    const count = await cards.count()
    const values = []
    for (let i = 0; i < count; i++) {
      const value = await cards.nth(i).locator('.stat-value').textContent()
      const label = await cards.nth(i).locator('.stat-label').textContent()
      values.push({ label, value })
    }
    return values
  }
}
