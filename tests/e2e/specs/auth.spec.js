import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage.js'
import { RegisterPage } from '../pages/RegisterPage.js'
import { HomePage } from '../pages/HomePage.js'
import { USERS } from '../fixtures/test-data.js'

test.describe('用户认证测试', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test.describe('注册功能', () => {
    test('应成功注册新用户', async ({ page }) => {
      const registerPage = new RegisterPage(page)
      await registerPage.goto()
      await registerPage.assertRegisterPageVisible()

      const newUser = USERS.newUser
      await registerPage.register(newUser.username, newUser.email, newUser.password)

      await registerPage.assertRegisterSuccess()
    })

    test('密码不一致时应显示错误', async ({ page }) => {
      const registerPage = new RegisterPage(page)
      await registerPage.goto()

      await registerPage.register('testuser', 'test@test.com', 'password123', 'differentpass')

      await registerPage.assertRegisterError('两次输入的密码不一致')
    })

    test('密码长度不足时应显示错误', async ({ page }) => {
      const registerPage = new RegisterPage(page)
      await registerPage.goto()

      await registerPage.register('testuser', 'test@test.com', '12345')

      await registerPage.assertRegisterError('密码长度不能少于6位')
    })
  })

  test.describe('登录功能', () => {
    test('应成功登录管理员账号', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()
      await loginPage.assertLoginPageVisible()

      await loginPage.login(USERS.admin.username, USERS.admin.password)

      await loginPage.assertLoginSuccess()
    })

    test('应成功登录普通用户账号', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await loginPage.login(USERS.user.username, USERS.user.password)

      await loginPage.assertLoginSuccess()
    })

    test('错误密码时应显示登录失败', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await loginPage.loginExpectFail(USERS.admin.username, 'wrongpassword')

      await loginPage.assertLoginError('用户名或密码错误')
    })

    test('登录后应能正确退出', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const homePage = new HomePage(page)

      await loginPage.goto()
      await loginPage.login(USERS.admin.username, USERS.admin.password)
      await loginPage.assertLoginSuccess()

      await homePage.logout()
      await homePage.assertLoggedOut()
    })
  })

  test.describe('权限控制', () => {
    test('未登录用户应能访问首页', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.assertHomePageVisible()
      await homePage.assertLoggedOut()
    })

    test('未登录用户访问需要权限的页面应被重定向到登录页', async ({ page }) => {
      await page.goto('/my-activities')
      await expect(page).toHaveURL('/login')
    })

    test('未登录用户访问管理页面应被重定向到登录页', async ({ page }) => {
      await page.goto('/admin/activities')
      await expect(page).toHaveURL('/login')
    })

    test('登录页面有注册链接', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await loginPage.clickRegister()

      await expect(page).toHaveURL('/register')
    })
  })
})
