import { expect } from '@playwright/test'
import { BasePage } from './BasePage.js'

export class CreateActivityPage extends BasePage {
  constructor(page) {
    super(page)
    this.titleInput = page.locator('#title')
    this.categorySelect = page.locator('#category')
    this.descriptionTextarea = page.locator('#description')
    this.timeInput = page.locator('#time')
    this.locationInput = page.locator('#location')
    this.capacityInput = page.locator('#capacity')
    this.submitButton = page.locator('button[type="submit"]')
  }

  async goto() {
    await this.navigate('/activity/create')
  }

  async assertCreatePageVisible() {
    await expect(this.page.locator('h2')).toContainText('发布活动')
  }

  async fillActivityForm(activity) {
    await this.titleInput.fill(activity.title)
    await this.categorySelect.selectOption(activity.category)
    await this.descriptionTextarea.fill(activity.description)
    await this.timeInput.fill(activity.time)
    await this.locationInput.fill(activity.location)
    await this.capacityInput.fill(activity.capacity)
  }

  async submit() {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept()
    })
    await this.submitButton.click()
    await this.waitForNavigation()
  }

  async createActivity(activity) {
    await this.fillActivityForm(activity)
    await this.submit()
  }

  async assertCreateSuccess() {
    await expect(this.page).toHaveURL(/\/my-activities/)
  }
}
