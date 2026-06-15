import { expect } from '@playwright/test'

export class BasePage {
  constructor(page) {
    this.page = page
  }

  async navigate(path = '/') {
    await this.page.goto(path)
    await this.page.waitForLoadState('networkidle')
  }

  async getPageTitle() {
    return this.page.locator('h1, h2').first()
  }

  async assertPageContains(text) {
    await expect(this.page.locator('body')).toContainText(text)
  }

  async assertUrlContains(path) {
    await expect(this.page).toHaveURL(new RegExp(path))
  }

  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle')
  }

  async clickNavLink(linkText) {
    await this.page.locator('nav a', { hasText: linkText }).click()
    await this.waitForNavigation()
  }

  async clickButton(buttonText) {
    await this.page.locator('button', { hasText: buttonText }).click()
  }

  async clickLink(linkText) {
    await this.page.locator('a', { hasText: linkText }).first().click()
  }

  async fillInput(labelText, value) {
    const label = this.page.locator('label', { hasText: labelText })
    const forAttr = await label.getAttribute('for')
    if (forAttr) {
      await this.page.fill(`#${forAttr}`, value)
    } else {
      await label.locator('..').locator('input, textarea, select').fill(value)
    }
  }

  async selectOption(labelText, value) {
    const label = this.page.locator('label', { hasText: labelText })
    const forAttr = await label.getAttribute('for')
    if (forAttr) {
      await this.page.selectOption(`#${forAttr}`, value)
    }
  }

  async checkCheckbox(labelText) {
    const label = this.page.locator('label', { hasText: labelText })
    const checkbox = label.locator('input[type="checkbox"]')
    if (!(await checkbox.isChecked())) {
      await label.click()
    }
  }

  async getAlertMessage() {
    this.page.on('dialog', async (dialog) => {
      await dialog.accept()
      return dialog.message()
    })
  }
}
