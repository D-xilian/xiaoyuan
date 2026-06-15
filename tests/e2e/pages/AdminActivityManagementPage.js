import { expect } from '@playwright/test'
import { BasePage } from './BasePage.js'

export class AdminActivityManagementPage extends BasePage {
  constructor(page) {
    super(page)
    this.pageTitle = page.locator('h2')
    this.activityCards = page.locator('.activity-card')
    this.refreshButton = page.locator('button:has-text("刷新列表")')
    this.loadingSpinner = page.locator('.spinner')
    this.noDataText = page.locator('.no-data')
  }

  async goto() {
    await this.navigate('/admin/activities')
  }

  async assertManagementPageVisible() {
    await expect(this.pageTitle).toContainText('活动管理')
  }

  async getActivityCount() {
    if (await this.noDataText.isVisible().catch(() => false)) {
      return 0
    }
    return await this.activityCards.count()
  }

  async getFirstActivityTitle() {
    return await this.activityCards.first().locator('h3').textContent()
  }

  async clickViewActivity(index = 0) {
    const btn = this.activityCards.nth(index).locator('a:has-text("查看详情")')
    await btn.click()
    await this.waitForNavigation()
  }

  async clickEditActivity(index = 0) {
    const btn = this.activityCards.nth(index).locator('a:has-text("编辑活动")')
    await btn.click()
    await this.waitForNavigation()
  }

  async deleteFirstActivity() {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept()
    })
    const btn = this.activityCards.first().locator('button:has-text("删除活动")')
    await btn.click()
    await this.waitForNavigation()
  }

  async clickRefresh() {
    await this.refreshButton.click()
    await this.waitForNavigation()
  }

  async waitForActivitiesLoaded() {
    await this.page.waitForSelector('.activity-card, .no-data', { timeout: 10000 })
  }
}
