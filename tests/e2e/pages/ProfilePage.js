import { expect } from '@playwright/test'
import { BasePage } from './BasePage.js'

export class ProfilePage extends BasePage {
  constructor(page) {
    super(page)
    this.userAvatar = page.locator('.avatar')
    this.userName = page.locator('.avatar-section h2')
    this.userEmail = page.locator('.user-email')
    this.editButton = page.locator('button:has-text("修改个人信息")')
    this.editModal = page.locator('.modal')
    this.publishedTab = page.locator('button:has-text("我发布的")')
    this.registeredTab = page.locator('button:has-text("我报名的")')
    this.activityCards = page.locator('.activity-card')
  }

  async goto() {
    await this.navigate('/profile')
  }

  async assertProfilePageVisible() {
    await expect(this.userAvatar).toBeVisible()
  }

  async getUserName() {
    return await this.userName.textContent()
  }

  async getPublishedActivityCount() {
    const text = await this.publishedTab.textContent()
    const match = text.match(/\((\d+)\)/)
    return match ? parseInt(match[1], 10) : 0
  }

  async getRegisteredActivityCount() {
    const text = await this.registeredTab.textContent()
    const match = text.match(/\((\d+)\)/)
    return match ? parseInt(match[1], 10) : 0
  }

  async switchToPublishedTab() {
    await this.publishedTab.click()
  }

  async switchToRegisteredTab() {
    await this.registeredTab.click()
  }

  async clickEditProfile() {
    await this.editButton.click()
    await expect(this.editModal).toBeVisible()
  }

  async updateEmail(newEmail) {
    await this.clickEditProfile()
    await this.page.fill('#editEmail', newEmail)
    await this.page.fill('#currentPassword', 'password')
    await this.page.locator('.modal .btn:has-text("保存")').click()
  }
}
