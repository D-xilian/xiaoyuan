import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage.js'
import { HomePage } from '../pages/HomePage.js'
import { CreateActivityPage } from '../pages/CreateActivityPage.js'
import { ActivityDetailPage } from '../pages/ActivityDetailPage.js'
import { AdminActivityManagementPage } from '../pages/AdminActivityManagementPage.js'
import { ProfilePage } from '../pages/ProfilePage.js'
import { USERS, ACTIVITY } from '../fixtures/test-data.js'

test.describe('活动管理功能测试', () => {
  let createdActivityId = null

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test.describe('活动创建', () => {
    test('管理员应能成功创建活动', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const createActivityPage = new CreateActivityPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()

      await createActivityPage.goto()
      await createActivityPage.assertCreatePageVisible()

      await createActivityPage.createActivity(ACTIVITY)

      await createActivityPage.assertCreateSuccess()
    })

    test('普通用户无法访问创建活动页面', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.user.username, USERS.user.password)

      await page.goto('/activity/create')

      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('无权限')
        await dialog.accept()
      })

      await expect(page).toHaveURL('/')
    })
  })

  test.describe('活动浏览', () => {
    test('首页应显示活动列表', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()

      const count = await homePage.getActivityCount()
      expect(typeof count).toBe('number')
    })

    test('应能点击查看活动详情', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()

      const count = await homePage.getActivityCount()
      if (count > 0) {
        await homePage.clickFirstActivityDetail()
        await expect(page).toHaveURL(/\/activity\/\d+/)
      }
    })
  })

  test.describe('活动收藏', () => {
    test('登录用户应能收藏活动', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const homePage = new HomePage(page)

      await loginPage.goto()
      await loginPage.login(USERS.user.username, USERS.user.password)

      await homePage.goto()
      const count = await homePage.getActivityCount()
      test.skip(count === 0, '没有活动可收藏')

      await homePage.clickFirstActivityDetail()

      const detailPage = new ActivityDetailPage(page)
      await detailPage.clickCollect()

      await detailPage.assertCollected()
    })
  })

  test.describe('活动管理', () => {
    test('管理员应能查看活动管理页面', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const adminPage = new AdminActivityManagementPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)

      await adminPage.goto()
      await adminPage.assertManagementPageVisible()
    })

    test('管理员应能看到活动列表', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const adminPage = new AdminActivityManagementPage(page)

      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)

      await adminPage.goto()
      await adminPage.waitForActivitiesLoaded()

      const count = await adminPage.getActivityCount()
      expect(typeof count).toBe('number')
    })
  })

  test.describe('活动评论', () => {
    test('登录用户应能评论活动', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const homePage = new HomePage(page)

      await loginPage.goto()
      await loginPage.login(USERS.user.username, USERS.user.password)

      await homePage.goto()
      const count = await homePage.getActivityCount()
      test.skip(count === 0, '没有活动可评论')

      await homePage.clickFirstActivityDetail()

      const detailPage = new ActivityDetailPage(page)
      const commentText = '这是一条自动化测试评论_' + Date.now()

      page.once('dialog', async (dialog) => {
        expect(dialog.message()).toContain('评论成功')
        await dialog.accept()
      })

      await detailPage.addComment(commentText)
    })
  })
})
