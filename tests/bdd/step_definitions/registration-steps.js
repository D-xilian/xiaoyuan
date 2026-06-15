export function registerRegistrationSteps(registry, world, { expect }) {

  registry.When(/^用户访问报名活动页面$/, async () => {
    await world.page.goto('http://localhost:5173/activity/register')
    await world.page.waitForLoadState('networkidle')
  })

  registry.Then(/^应该显示报名页面标题 "([^"]+)"$/, async (expectedTitle) => {
    await expect(world.page.locator('.page-title')).toContainText(expectedTitle)
  })

  registry.Given(/^存在可报名的活动$/, async () => {
    await world.page.goto('http://localhost:5173/')
    await world.page.waitForLoadState('networkidle')
    const res = await world.page.evaluate(async () => {
      const resp = await fetch('http://localhost:5000/api/activities')
      const data = await resp.json()
      return Array.isArray(data) && data.length > 0 ? { id: data[0].id, title: data[0].title } : null
    })
    if (res) {
      world.set('availableActivity', res)
    } else {
      world.set('availableActivity', null)
    }
  })

  registry.When(/^用户访问报名页面并选择活动$/, async () => {
    const activity = world.get('availableActivity')
    if (activity) {
      await world.page.goto(`http://localhost:5173/activity/register/${activity.id}`)
      await world.page.waitForLoadState('networkidle')
    }
  })

  registry.When(/^填写报名信息$/, async () => {
    const textarea = world.page.locator('#introduction')
    if (await textarea.isVisible()) {
      await textarea.fill('我是计算机学院大二学生，通过BDD自动化测试报名，对校园活动有浓厚兴趣。')
    }
  })

  registry.When(/^用户勾选同意条款$/, async () => {
    const checkbox = world.page.locator('label:has-text("我已阅读并同意")')
    if (await checkbox.isVisible()) {
      await checkbox.click()
    }
  })

  registry.When(/^填写报名信息但不勾选同意条款$/, async () => {
    const textarea = world.page.locator('#introduction')
    if (await textarea.isVisible()) {
      await textarea.fill('测试不勾选条款的报名场景。')
    }
  })

  registry.When(/^用户点击提交报名按钮$/, async () => {
    world.page.on('dialog', async (dialog) => {
      await dialog.accept()
    })
    await world.page.click('button[type="submit"]')
    await world.page.waitForLoadState('networkidle')
  })

  registry.Then(/^应该提示 "([^"]+)"$/, async (expectedMsg) => {
    await expect(world.page.locator('.success-message').first()).toContainText(expectedMsg, { timeout: 5000 })
  })

  registry.Then(/^应该显示验证错误信息$/, async () => {
    const errorVisible = await world.page.locator('.error-message').first().isVisible().catch(() => false)
    expect(errorVisible).toBeTruthy()
  })

  registry.When(/^用户访问个人中心$/, async () => {
    await world.page.goto('http://localhost:5173/profile')
    await world.page.waitForLoadState('networkidle')
  })

  registry.Then(/^应该显示用户头像和基本信息$/, async () => {
    await expect(world.page.locator('.avatar')).toBeVisible()
  })

  registry.Then(/^应能看到 "([^"]+)" 标签$/, async (tabText) => {
    await expect(world.page.locator('button', { hasText: tabText })).toBeVisible()
  })

  registry.Then(/^导航栏应包含 "([^"]+)"$/, async (text) => {
    await expect(world.page.locator('nav')).toContainText(text)
  })

  registry.Then(/^导航栏不应包含 "([^"]+)"$/, async (text) => {
    await expect(world.page.locator('nav')).not.toContainText(text)
  })
}
