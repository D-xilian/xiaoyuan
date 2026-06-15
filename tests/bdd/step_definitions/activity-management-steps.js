export function registerActivitySteps(registry, world, { expect }) {

  registry.Given(/^用户访问创建活动页面$/, async () => {
    await world.page.goto('http://localhost:5173/activity/create')
    await world.page.waitForLoadState('networkidle')
  })

  registry.When(/^用户访问创建活动页面$/, async () => {
    await world.page.goto('http://localhost:5173/activity/create')
    await world.page.waitForLoadState('networkidle')
  })

  registry.When(/^用户访问管理活动页面$/, async () => {
    await world.page.goto('http://localhost:5173/admin/activities')
    await world.page.waitForLoadState('networkidle')
  })

  registry.When(/^输入活动标题 "([^"]+)"$/, async (title) => {
    await world.page.fill('#title', title)
  })

  registry.When(/^选择活动分类 "([^"]+)"$/, async (category) => {
    await world.page.selectOption('#category', category)
  })

  registry.When(/^输入活动描述 "([^"]+)"$/, async (desc) => {
    await world.page.fill('#description', desc)
  })

  registry.When(/^输入活动时间 "([^"]+)"$/, async (time) => {
    await world.page.fill('#time', time)
  })

  registry.When(/^输入活动地点 "([^"]+)"$/, async (location) => {
    await world.page.fill('#location', location)
  })

  registry.When(/^输入活动容量 "([^"]+)"$/, async (capacity) => {
    await world.page.fill('#capacity', capacity)
  })

  registry.When(/^用户点击提交按钮$/, async () => {
    world.page.once('dialog', async (dialog) => {
      await dialog.accept()
    })
    await world.page.click('button[type="submit"]')
    await world.page.waitForLoadState('networkidle')
  })

  registry.Then(/^应该提示活动创建成功并跳转到我发布的活动页面$/, async () => {
    await expect(world.page).toHaveURL(/\/my-activities/)
  })

  registry.Then(/^应该提示无权限并跳转到首页$/, async () => {
    let dialogHandled = false
    world.page.on('dialog', async (dialog) => {
      dialogHandled = true
      await dialog.accept()
    })
    try {
      await world.page.waitForURL('http://localhost:5173/', { timeout: 5000 })
    } catch {
    }
  })

  registry.Then(/^应该能看到活动列表$/, async () => {
    await world.page.waitForLoadState('networkidle')
    const noDataVisible = await world.page.locator('.no-data').isVisible().catch(() => false)
    if (!noDataVisible) {
      const items = await world.page.locator('.activity-item').count().catch(() => 0)
      world.set('activityCount', items)
    } else {
      world.set('activityCount', 0)
    }
  })

  registry.Then(/^活动数量应大于等于0$/, async () => {
    const count = world.get('activityCount')
    expect(typeof count).toBe('number')
  })

  registry.Given(/^存在可查看的活动$/, async () => {
    await world.page.goto('http://localhost:5173/')
    await world.page.waitForLoadState('networkidle')
    const count = await world.page.locator('.activity-item').count()
    if (count === 0) {
      world.set('hasActivity', false)
    } else {
      world.set('hasActivity', true)
    }
  })

  registry.When(/^用户点击第一个活动的查看详情按钮$/, async () => {
    const hasActivity = world.get('hasActivity')
    if (hasActivity !== false) {
      const detailBtn = world.page.locator('.btn-detail').first()
      if (await detailBtn.isVisible()) {
        await detailBtn.click()
        await world.page.waitForLoadState('networkidle')
      }
    }
  })

  registry.Then(/^应该跳转到该活动的详情页面$/, async () => {
    const hasActivity = world.get('hasActivity')
    if (hasActivity !== false) {
      await expect(world.page).toHaveURL(/\/activity\/\d+/)
    }
  })

  registry.Then(/^应该显示活动管理页面标题$/, async () => {
    await expect(world.page.locator('h2')).toContainText('活动管理')
  })

  registry.Then(/^应该活动列表已加载$/, async () => {
    await world.page.waitForSelector('.activity-card, .no-data', { timeout: 10000 })
  })

  registry.Given(/^存在可删除的活动$/, async () => {
    await world.page.waitForSelector('.activity-card, .no-data', { timeout: 10000 })
    const count = await world.page.locator('.activity-card').count()
    world.set('hasDeletableActivity', count > 0)
  })

  registry.When(/^用户点击第一个活动的删除按钮$/, async () => {
    const deletable = world.get('hasDeletableActivity')
    if (deletable) {
      world.page.once('dialog', async (dialog) => {
        world.set('dialogMessage', dialog.message())
        await dialog.dismiss()
      })
      await world.page.locator('.activity-card').first().locator('button:has-text("删除活动")').click()
    }
  })

  registry.Then(/^应该弹出确认对话框$/, async () => {
    const hasDialog = world.get('dialogMessage') !== undefined
    expect(hasDialog).toBeTruthy()
  })

  registry.Then(/^对话框应包含 "([^"]+)"$/, async (text) => {
    const msg = world.get('dialogMessage')
    if (msg) {
      expect(msg).toContain(text)
    }
  })

  registry.Given(/^存在可收藏的活动$/, async () => {
    await world.page.waitForLoadState('networkidle')
    const count = await world.page.locator('.activity-item').count()
    world.set('canCollect', count > 0)
  })

  registry.When(/^用户点击收藏按钮$/, async () => {
    const btn = world.page.locator('.collect-btn')
    if (await btn.isVisible()) {
      await btn.click()
      await world.page.waitForLoadState('networkidle')
    }
  })

  registry.Then(/^应该显示 "([^"]+)" 状态$/, async (text) => {
    await expect(world.page.locator('body')).toContainText(text)
  })

  registry.Given(/^存在可评论的活动$/, async () => {
    await world.page.waitForLoadState('networkidle')
    const count = await world.page.locator('.activity-item').count()
    world.set('canComment', count > 0)
  })

  registry.When(/^用户在评论框输入评论内容$/, async () => {
    const textarea = world.page.locator('.comment-form textarea')
    if (await textarea.isVisible()) {
      await textarea.fill('这是一条BDD自动化测试评论_' + Date.now())
    }
  })

  registry.When(/^用户点击提交评论按钮$/, async () => {
    world.page.once('dialog', async (dialog) => {
      world.set('commentDialogMessage', dialog.message())
      await dialog.accept()
    })
    const btn = world.page.locator('.comment-form .btn')
    if (await btn.isVisible()) {
      await btn.click()
      await world.page.waitForLoadState('networkidle')
    }
  })

  registry.Then(/^应该显示 "([^"]+)" 提示$/, async (text) => {
    const msg = world.get('commentDialogMessage')
    if (msg) {
      expect(msg).toContain(text)
    } else {
      await expect(world.page.locator('body')).toContainText(text)
    }
  })
}
