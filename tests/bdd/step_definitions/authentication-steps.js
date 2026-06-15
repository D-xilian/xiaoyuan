export function registerAuthSteps(registry, world, { expect }) {

  registry.Given(/^未登录用户访问 "([^"]+)"$/, async (path) => {
    await world.page.goto(`http://localhost:5173${path}`)
    await world.page.waitForLoadState('networkidle')
  })

  registry.When(/^未登录用户访问 "([^"]+)"$/, async (path) => {
    await world.page.goto(`http://localhost:5173${path}`)
    await world.page.waitForLoadState('networkidle')
  })

  registry.When(/^用户未登录$/, async () => {
    await world.page.goto('http://localhost:5173/')
    await world.page.evaluate(() => localStorage.clear())
  })

  registry.When(/^用户使用管理员账号登录系统$/, async () => {
    await world.page.goto('http://localhost:5173/login')
    await world.page.waitForLoadState('networkidle')
    await world.page.fill('#username', 'dzr')
    await world.page.fill('#password', '123456')
    await world.page.click('button[type="submit"]')
    await world.page.waitForURL('http://localhost:5173/', { timeout: 10000 })
    await world.page.waitForLoadState('networkidle')
    await expect(world.page.locator('nav')).toContainText('退出登录')
  })

  registry.When(/^用户使用普通用户账号登录系统$/, async () => {
    await world.page.goto('http://localhost:5173/login')
    await world.page.waitForLoadState('networkidle')
    await world.page.fill('#username', 'xzh')
    await world.page.fill('#password', '234567')
    await world.page.click('button[type="submit"]')
    await world.page.waitForURL('http://localhost:5173/', { timeout: 10000 })
    await world.page.waitForLoadState('networkidle')
    await expect(world.page.locator('nav')).toContainText('退出登录')
  })

  registry.When(/^用户访问登录页面$/, async () => {
    await world.page.goto('http://localhost:5173/login')
    await world.page.waitForLoadState('networkidle')
  })

  registry.When(/^用户访问注册页面$/, async () => {
    await world.page.goto('http://localhost:5173/register')
    await world.page.waitForLoadState('networkidle')
  })

  registry.When(/^用户访问首页$/, async () => {
    await world.page.goto('http://localhost:5173/')
    await world.page.waitForLoadState('networkidle')
  })

  registry.When(/^输入用户名 "([^"]+)"$/, async (username) => {
    await world.page.fill('#username', username)
  })

  registry.When(/^输入邮箱 "([^"]+)"$/, async (email) => {
    await world.page.fill('#email', email)
  })

  registry.When(/^输入密码 "([^"]+)"$/, async (password) => {
    await world.page.fill('#password', password)
  })

  registry.When(/^确认密码 "([^"]+)"$/, async (password) => {
    await world.page.fill('#confirmPassword', password)
  })

  registry.When(/^用户点击注册按钮$/, async () => {
    await world.page.click('button[type="submit"]')
    await world.page.waitForLoadState('networkidle')
  })

  registry.When(/^用户点击登录按钮$/, async () => {
    await world.page.click('button[type="submit"]')
    await world.page.waitForLoadState('networkidle')
  })

  registry.When(/^用户访问 "([^"]+)"$/, async (path) => {
    await world.page.goto(`http://localhost:5173${path}`)
    await world.page.waitForLoadState('networkidle')
  })

  registry.When(/^用户点击退出登录链接$/, async () => {
    await world.page.click('a:has-text("退出登录")')
    await world.page.waitForURL(/\/login/, { timeout: 5000 })
  })

  registry.When(/^用户点击导航 "([^"]+)"$/, async (linkText) => {
    await world.page.locator('nav a', { hasText: linkText }).click()
    await world.page.waitForLoadState('networkidle')
  })

  registry.When(/^用户返回首页并点击导航 "([^"]+)"$/, async (linkText) => {
    await world.page.goto('http://localhost:5173/')
    await world.page.waitForLoadState('networkidle')
    await world.page.locator('nav a', { hasText: linkText }).click()
    await world.page.waitForLoadState('networkidle')
  })

  registry.When(/^用户点击注册链接$/, async () => {
    await world.page.click('a[href="/register"]')
    await world.page.waitForLoadState('networkidle')
  })

  registry.Then(/^应该提示注册成功并跳转到登录页$/, async () => {
    await expect(world.page).toHaveURL(/\/login/)
  })

  registry.Then(/^应该显示错误信息 "([^"]+)"$/, async (errorMsg) => {
    await expect(world.page.locator('.error')).toBeVisible()
    await expect(world.page.locator('.error')).toContainText(errorMsg)
  })

  registry.Then(/^应该登录成功并跳转到首页$/, async () => {
    await expect(world.page).toHaveURL('http://localhost:5173/')
    await expect(world.page.locator('nav')).toContainText('退出登录')
  })

  registry.Then(/^页面应显示 "([^"]+)"$/, async (text) => {
    await expect(world.page.locator('body')).toContainText(text)
  })

  registry.Then(/^应该退出成功并跳转到登录页$/, async () => {
    await expect(world.page).toHaveURL(/\/login/)
  })

  registry.Then(/^页面应包含 "([^"]+)" 和 "([^"]+)" 链接$/, async (text1, text2) => {
    await expect(world.page.locator('body')).toContainText(text1)
    await expect(world.page.locator('body')).toContainText(text2)
  })

  registry.Then(/^应该被重定向到登录页$/, async () => {
    await expect(world.page).toHaveURL(/\/login/)
  })

  registry.Then(/^应该跳转到登录页$/, async () => {
    await expect(world.page).toHaveURL(/\/login/)
  })

  registry.Then(/^应该跳转到注册页面$/, async () => {
    await expect(world.page).toHaveURL(/\/register/)
  })

  registry.Then(/^应该跳转到(\S+)页面$/, async (expectedUrl) => {
    await expect(world.page).toHaveURL(new RegExp(expectedUrl))
  })

  registry.Then(/^应该跳转到创建活动页面$/, async () => {
    await expect(world.page).toHaveURL(/\/activity\/create/)
  })

  registry.Then(/^应该跳转到活动管理页面$/, async () => {
    await expect(world.page).toHaveURL(/\/admin\/activities/)
  })

  registry.Then(/^应该跳转到用户管理页面$/, async () => {
    await expect(world.page).toHaveURL(/\/admin\/users/)
  })
}
