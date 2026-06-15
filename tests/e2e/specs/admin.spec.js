import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage.js'
import { HomePage } from '../pages/HomePage.js'
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
      const homePage = new HomePage(page)

      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()

      await expect(page.locator('nav')).toContainText('用户管理')
      await expect(page.locator('nav')).toContainText('创建活动')
      await expect(page.locator('nav')).toContainText('管理活动')
    })

    test('普通用户登录后不应看到管理员菜单', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const homePage = new HomePage(page)

      await loginPage.goto()
      await loginPage.login(USERS.user.username, USERS.user.password)
      await loginPage.assertLoginSuccess()

      await expect(page.locator('nav')).not.toContainText('用户管理')
      await expect(page.locator('nav')).not.toContainText('创建活动')
    })
  })

  test.describe('数据仪表盘', () => {
    test('管理员应能访问数据仪表盘', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new AdminDashboardPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()

      await dashboardPage.goto()
      await dashboardPage.assertDashboardVisible()
    })

    test('仪表盘应显示统计数据', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new AdminDashboardPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()

      await dashboardPage.goto()
      await dashboardPage.assertDashboardVisible()

      const stats = await dashboardPage.getStatCardValues()
      expect(stats.length).toBeGreaterThanOrEqual(4)
      expect(stats[0].label).toBe('活动总数')
    })

    test('仪表盘应显示热门活动列表', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new AdminDashboardPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()

      await dashboardPage.goto()
      await dashboardPage.assertTopActivitiesVisible()
    })

    test('普通用户访问仪表盘应被阻止', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.user.username, USERS.user.password)

      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('无权限')
        await dialog.accept()
      })

      await page.goto('/admin/dashboard')
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('活动管理', () => {
    test('管理员应能创建活动', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const createActivityPage = new CreateActivityPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()

      await createActivityPage.goto()
      await createActivityPage.assertCreatePageVisible()

      await createActivityPage.fillActivityForm(ACTIVITY)

      await createActivityPage.submit()
      await createActivityPage.assertCreateSuccess()
    })

    test('管理员删除活动需要确认', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const adminPage = new AdminActivityManagementPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()

      await adminPage.goto()
      await adminPage.waitForActivitiesLoaded()

      const count = await adminPage.getActivityCount()
      test.skip(count === 0, '没有活动可删除')

      let dialogTriggered = false
      page.on('dialog', async (dialog) => {
        dialogTriggered = true
        expect(dialog.message()).toContain('删除')
        await dialog.dismiss()
      })

      const deleteBtn = adminPage.activityCards.first().locator('button:has-text("删除活动")')
      await deleteBtn.click()

      expect(dialogTriggered).toBeTruthy()
    })
  })

  test.describe('管理员导航链接', () => {
    test('管理员应能通过导航访问各管理页面', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const homePage = new HomePage(page)

      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()

      // 分别从首页导航访问各管理页面，确保每次从首页开始
      await homePage.clickNavLink('用户管理')
      await expect(page).toHaveURL('/admin/users')

      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await homePage.clickNavLink('创建活动')
      await expect(page).toHaveURL('/activity/create')

      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await homePage.clickNavLink('管理活动')
      await expect(page).toHaveURL('/admin/activities')
    })
  })
})
