import { expect } from '@playwright/test'
import { BasePage } from './BasePage.js'

export class ActivityDetailPage extends BasePage {
  constructor(page) {
    super(page)
    this.activityTitle = page.locator('h2')
    this.activityInfo = page.locator('.activity-info')
    this.activityDescription = page.locator('.activity-description')
    this.collectButton = page.locator('.collect-btn')
    this.deleteButton = page.locator('.delete-btn')
    this.joinButton = page.locator('.join-btn')
    this.editLink = page.locator('.edit-btn')
    this.commentTextarea = page.locator('.comment-form textarea')
    this.commentSubmitButton = page.locator('.comment-form .btn')
    this.commentList = page.locator('.comment-list')
  }

  async goto(activityId) {
    await this.navigate(`/activity/${activityId}`)
  }

  async assertDetailPageVisible() {
    await expect(this.page.locator('header h1')).toContainText('校园活动详情')
  }

  async getActivityTitle() {
    return await this.activityTitle.textContent()
  }

  async getActivityInfo() {
    return await this.activityInfo.textContent()
  }

  async clickCollect() {
    await this.collectButton.click()
  }

  async assertCollected() {
    await expect(this.collectButton).toContainText('已收藏')
  }

  async clickDelete() {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept()
    })
    await this.deleteButton.click()
    await this.waitForNavigation()
  }

  async addComment(content) {
    await this.commentTextarea.fill(content)
    await this.commentSubmitButton.click()
  }

  async assertCommentVisible(content) {
    await expect(this.commentList).toContainText(content)
  }

  async clickJoin() {
    await this.joinButton.click()
    await this.waitForNavigation()
  }

  async clickEdit() {
    await this.editLink.click()
    await this.waitForNavigation()
  }
}
