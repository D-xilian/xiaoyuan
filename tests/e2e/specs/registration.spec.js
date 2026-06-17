import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage.js'
import { USERS, REGISTRATION } from '../fixtures/test-data.js'

test.describe('活动报名功能测试', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test.describe('报名页面', () => {
    test('未登录用户访问报名页面应被重定向', async ({ page }) => {
      await page.goto('/activity/register')
      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('报名提交', () => {
    test('填写完整信息后应能成功报名', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()
      await loginPage.login(USERS.user.username, USERS.user.password)
      await loginPage.assertLoginSuccess()

      // 获取第一个活动ID
      const activityOption = await page.evaluate(async () => {
        const res = await fetch('/api/activities')
        const activities = await res.json()
        return activities[0] ? { id: activities[0].id, title: activities[0].title } : null
      })

      test.skip(!activityOption, '没有可报名的活动')

      // 导航到报名页面（带活动ID），category 和 activity 自动填充并禁用
      await page.goto(`/activity/register/${activityOption.id}`)
      await page.waitForLoadState('networkidle')

      // 填写完整报名信息（姓名、手机号、个人介绍）
      await page.locator('#name').fill(REGISTRATION.name)
      await page.locator('#phone').fill(REGISTRATION.phone)
      await page.locator('#introduction').fill(REGISTRATION.introduction)

      // 勾选同意条款
      const checkbox = page.locator('label:has-text("我已阅读并同意")')
      if (await checkbox.isVisible()) {
        await checkbox.click()
      }

      // 提交
      await page.locator('button[type="submit"]').click()
      await page.waitForLoadState('networkidle')

      // 验证报名成功
      await expect(page.locator('.success-message').first()).toContainText('报名成功', { timeout: 5000 })
    })
  })
})
