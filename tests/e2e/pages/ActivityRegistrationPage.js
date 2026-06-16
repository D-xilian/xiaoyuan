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
    this.nameInput = page.locator('#name')
    this.phoneInput = page.locator('#phone')
    this.emailInput = page.locator('#email')
    this.departmentSelect = page.locator('#department')
    this.studentIdInput = page.locator('#studentId')
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
    if (registration.name) {
      await this.nameInput.fill(registration.name)
    }
    if (registration.phone) {
      await this.phoneInput.fill(registration.phone)
    }
    if (registration.email) {
      await this.emailInput.fill(registration.email)
    }
    if (registration.department) {
      await this.departmentSelect.selectOption(registration.department)
    }
    if (registration.studentId) {
      await this.studentIdInput.fill(registration.studentId)
    }
    await this.introductionTextarea.fill(registration.introduction)
  }

  async agreeTerms() {
    await this.agreeTermsCheckbox.click()
  }

  async submit() {
    await this.submitButton.click()
    await this.waitForNavigation()
  }

  async registerForActivity(activityId, registration) {
    await this.goto(activityId)
    await this.fillRegistrationForm(registration)
    await this.agreeTerms()
    await this.submit()
    await this.assertRegistrationSuccess()
  }

  async assertRegistrationSuccess() {
    await expect(this.successMessage.or(this.page.locator('body'))).toContainText('报名成功', { timeout: 5000 })
  }

  async assertValidationError() {
    await expect(this.page.locator('.error-message').first()).toBeVisible()
  }
}
