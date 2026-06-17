import { expect } from '@playwright/test'
import { BasePage } from './BasePage.js'

export class HomePage extends BasePage {
  constructor(page) {
    super(page)
    this.activityItems = page.locator('.activity-item')
    this.loadingText = page.locator('.loading')
    this.noDataText = page.locator('.no-data')
  }

  async goto() {
    await this.navigate('/')
  }

  async getActivityCount() {
    if (await this.noDataText.isVisible().catch(() => false)) {
      return 0
    }
    return await this.activityItems.count()
  }

  async clickFirstActivityDetail() {
    await this.page.locator('.btn-detail, a:has-text("查看详情")').first().click()
    await this.waitForNav()
  }
}
