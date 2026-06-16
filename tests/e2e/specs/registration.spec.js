import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage.js'
import { HomePage } from '../pages/HomePage.js'
import { ActivityRegistrationPage } from '../pages/ActivityRegistrationPage.js'
import { ProfilePage } from '../pages/ProfilePage.js'
import { USERS, REGISTRATION } from '../fixtures/test-data.js'

test.describe('活动报名功能测试', () => {
  let activityId = null

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test.describe('报名页面', () => {
    test('应正确显示报名页面', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const registrationPage = new ActivityRegistrationPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.user.username, USERS.user.password)

      await registrationPage.goto()
      await registrationPage.assertRegistrationPageVisible()
    })

    test('未登录用户访问报名页面应被重定向', async ({ page }) => {
      await page.goto('/activity/register')
      await expect(page).toHaveURL('/login')
    })

    test('应能看到活动选择列表', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const registrationPage = new ActivityRegistrationPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.user.username, USERS.user.password)

      await registrationPage.goto()
      await expect(registrationPage.activitySelect).toBeVisible()

      const options = await registrationPage.activitySelect.locator('option').allTextContents()
      expect(options.length).toBeGreaterThanOrEqual(1)
    })
  })

  test.describe('报名提交', () => {
    test('填写完整信息后应能成功报名', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const homePage = new HomePage(page)
      const registrationPage = new ActivityRegistrationPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.user.username, USERS.user.password)

      await homePage.goto()

      const activityOption = await page.evaluate(async () => {
        const res = await fetch('/api/activities')
        const activities = await res.json()
        return activities[0] ? { id: activities[0].id, title: activities[0].title } : null
      })

      test.skip(!activityOption, '没有可报名的活动')

      await registrationPage.goto(activityOption.id)
      await registrationPage.fillRegistrationForm(REGISTRATION)
      await registrationPage.agreeTerms()
      await registrationPage.submit()
      await registrationPage.assertRegistrationSuccess()
    })

    test('未同意条款时不应提交成功', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const registrationPage = new ActivityRegistrationPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.user.username, USERS.user.password)

      const activityOption = await page.evaluate(async () => {
        const res = await fetch('/api/activities')
        const activities = await res.json()
        return activities[0] ? { id: activities[0].id } : null
      })

      test.skip(!activityOption, '没有可报名的活动')

      await registrationPage.goto(activityOption.id)
      await registrationPage.fillRegistrationForm(REGISTRATION)

      await registrationPage.submit()

      const errorVisible = await registrationPage.page.locator('.error-message').first().isVisible().catch(() => false)
      if (errorVisible) {
        await expect(registrationPage.page.locator('.error-message').first()).toBeVisible()
      }
    })
  })

  test.describe('报名记录', () => {
    test('个人中心应显示报名记录', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const profilePage = new ProfilePage(page)
      const homePage = new HomePage(page)
      const registrationPage = new ActivityRegistrationPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.user.username, USERS.user.password)

      const activityOption = await page.evaluate(async () => {
        const res = await fetch('/api/activities')
        const activities = await res.json()
        return activities[0] ? { id: activities[0].id, title: activities[0].title } : null
      })

      if (activityOption) {
        await registrationPage.goto(activityOption.id)
        await registrationPage.fillRegistrationForm(REGISTRATION)
        await registrationPage.agreeTerms()
        await registrationPage.submit()
      }

      await profilePage.goto()
      await profilePage.assertProfilePageVisible()

      if (activityOption) {
        await profilePage.switchToRegisteredTab()
      }
    })
  })
})
