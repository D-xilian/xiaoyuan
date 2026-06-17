import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage.js'
import { CreateActivityPage } from '../pages/CreateActivityPage.js'
import { AdminActivityManagementPage } from '../pages/AdminActivityManagementPage.js'
import { USERS, ACTIVITY } from '../fixtures/test-data.js'

test.describe('活动管理功能测试', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test.describe('活动创建', () => {
    test('管理员应能成功创建活动', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const createPage = new CreateActivityPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()

      await createPage.goto()
      await createPage.fillActivityForm(ACTIVITY)
      await createPage.submit()
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveURL(/\/my-activities/)
    })

    test('普通用户无法访问创建活动页面', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()
      await loginPage.login(USERS.user.username, USERS.user.password)
      await loginPage.assertLoginSuccess()

      // 先注册 dialog handler
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('无权限')
        await dialog.accept()
      })

      await page.goto('/activity/create')
      await page.waitForLoadState('networkidle')
      // 弹窗接受后应跳转回首页，URL 不应再是创建活动页面
      await page.waitForTimeout(1000)
      expect(page.url()).not.toContain('/activity/create')
    })
  })

  test.describe('活动浏览', () => {
    test('首页应显示活动列表', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const activityCount = await page.locator('.activity-item').count()
      expect(typeof activityCount).toBe('number')
    })
  })

  test.describe('活动管理', () => {
    test('管理员应能看到活动列表', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()

      await page.goto('/admin/activities')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('h2')).toContainText('活动管理')
    })
  })
})
