import { expect } from '@playwright/test'
import { BasePage } from './BasePage.js'

export class HomePage extends BasePage {
  constructor(page) {
    super(page)
    this.headerTitle = page.locator('header h1')
    this.activityList = page.locator('.activity-list')
    this.activityItems = page.locator('.activity-item')
    this.loadingText = page.locator('.loading')
    this.noDataText = page.locator('.no-data')
  }

  async goto() {
    await this.navigate('/')
  }

  async assertHomePageVisible() {
    await expect(this.headerTitle).toContainText('校园活动发布平台')
  }

  async getActivityCount() {
    if (await this.noDataText.isVisible().catch(() => false)) {
      return 0
    }
    return await this.activityItems.count()
  }

  async getActivityTitles() {
    return await this.page.locator('.activity-item h3').allTextContents()
  }

  async clickActivityDetail(activityId) {
    const link = this.page.locator(`a[href="/activity/${activityId}"]`)
    await link.click()
    await this.waitForNavigation()
  }

  async clickFirstActivityDetail() {
    const link = this.page.locator('.btn-detail').first()
    await link.click()
    await this.waitForNavigation()
  }

  async clickJoinButton(activityId) {
    const link = this.page.locator(`a[href="/activity/register/${activityId}"]`)
    await link.click()
    await this.waitForNavigation()
  }

  async assertLoggedIn() {
    await expect(this.page.locator('nav')).toContainText('个人中心')
    await expect(this.page.locator('nav')).toContainText('退出登录')
  }

  async assertLoggedOut() {
    // 退出登录后会跳转到 /login，Login 页面无 nav 元素
    // 改检查 body 中是否包含登录/注册链接
    await expect(this.page.locator('body')).toContainText('登录')
    await expect(this.page.locator('body')).toContainText('注册')
  }

  async logout() {
    await this.page.locator('a:has-text("退出登录")').click()
    await this.page.waitForURL(/\/login/, { timeout: 5000 })
  }
}
