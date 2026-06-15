import { expect } from '@playwright/test'
import { BasePage } from './BasePage.js'

export class ActivityRegistrationPage extends BasePage {
  constructor(page) {
    super(page)
    this.categorySelect = page.locator('#category')
    this.activitySelect = page.locator('#activity')
    this.introductionTextarea = page.locator('#introduction')
    this.agreeTermsCheckbox = page.locator('label:has-text("我已阅读并同意")')
    this.submitButton = page.locator('button[type="submit"]')
    this.successMessage = page.locator('.success-message, .success-alert')
    this.resetButton = page.locator('button:has-text("重置")')
  }

  async goto(activityId) {
    if (activityId) {
      await this.navigate(`/activity/register/${activityId}`)
    } else {
      await this.navigate('/activity/register')
    }
  }

  async assertRegistrationPageVisible() {
    await expect(this.page.locator('.page-title')).toContainText('活动报名')
  }

  async selectCategory(category) {
    await this.categorySelect.selectOption(category)
  }

  async selectActivity(activityId) {
    await this.activitySelect.selectOption(String(activityId))
  }

  async fillRegistrationForm(registration) {
    await this.introductionTextarea.fill(registration.introduction)
  }

  async agreeTerms() {
    await this.agreeTermsCheckbox.click()
  }

  async submit() {
    await this.submitButton.click()
    // 表单提交后页面不跳转，等待 API 完成
    await this.page.waitForLoadState('networkidle')
  }

  async registerForActivity(activityId, registration) {
    await this.goto(activityId)
    await this.fillRegistrationForm(registration)
    await this.agreeTerms()
    await this.submit()
    await this.assertRegistrationSuccess()
  }

  async assertRegistrationSuccess() {
    await expect(this.successMessage.first()).toContainText('报名成功', { timeout: 5000 })
  }

  async assertValidationError() {
    await expect(this.page.locator('.error-message').first()).toBeVisible()
  }
}
