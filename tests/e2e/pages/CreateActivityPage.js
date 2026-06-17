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
    // 等待表单加载，确认没有被重定向
    await this.page.waitForSelector('h2', { timeout: 5000 })
    // 如果 h2 内容是"用户登录"，说明被重定向了
    const heading = await this.page.locator('h2').textContent()
    if (heading && heading.includes('登录')) {
      throw new Error('创建活动页面被重定向到登录页，请检查登录状态')
    }
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
    await this.page.waitForLoadState('networkidle')
  }
}
