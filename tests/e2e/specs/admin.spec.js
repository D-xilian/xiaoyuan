import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage.js'
import { AdminDashboardPage } from '../pages/AdminDashboardPage.js'
import { AdminActivityManagementPage } from '../pages/AdminActivityManagementPage.js'
import { CreateActivityPage } from '../pages/CreateActivityPage.js'
import { USERS, ACTIVITY } from '../fixtures/test-data.js'

test.describe('管理员功能测试', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test.describe('管理员导航', () => {
    test('管理员登录后应看到管理员菜单', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()
      await expect(page.locator('nav')).toContainText('管理中心')
    })

    test('普通用户登录后不应看到管理员菜单', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()
      await loginPage.login(USERS.user.username, USERS.user.password)
      await loginPage.assertLoginSuccess()
      await expect(page.locator('nav')).toContainText('活动服务')
      await expect(page.locator('nav')).not.toContainText('管理中心')
    })
  })

  test.describe('数据仪表盘', () => {
    test('管理员应能访问数据仪表盘', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()
      await page.goto('/admin/dashboard')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('h2')).toContainText('数据仪表盘')
    })
  })

  test.describe('活动管理', () => {
    test('管理员应能创建活动', async ({ page }) => {
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

    test('管理员应能查看活动管理页面', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const adminPage = new AdminActivityManagementPage(page)
      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()
      await adminPage.goto()
      await adminPage.assertManagementPageVisible()
    })
  })
})
