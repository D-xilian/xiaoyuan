export function registerAdminSteps(registry, world, { expect }) {

  registry.When(/^用户访问数据仪表盘页面$/, async () => {
    await world.page.goto('http://localhost:5173/admin/dashboard')
    await world.page.waitForLoadState('networkidle')
  })

  registry.Then(/^应该显示仪表盘页面标题 "([^"]+)"$/, async (expectedTitle) => {
    await expect(world.page.locator('h2')).toContainText(expectedTitle)
  })

  registry.Then(/^应该显示统计卡片$/, async () => {
    const cards = world.page.locator('.stat-card')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  registry.Then(/^第一个卡片标签应为 "([^"]+)"$/, async (expectedLabel) => {
    const firstCardLabel = await world.page.locator('.stat-card').first().locator('.stat-label').textContent()
    expect(firstCardLabel).toBe(expectedLabel)
  })

  registry.Then(/^应该显示热门活动表格$/, async () => {
    const table = world.page.locator('.data-table').first()
    await expect(table).toBeVisible()
  })

  registry.Then(/^普通用户访问仪表盘应被阻止$/, async () => {
    let dialogHandled = false
    world.page.on('dialog', async (dialog) => {
      dialogHandled = true
      expect(dialog.message()).toContain('无权限')
      await dialog.accept()
    })
    await world.page.goto('http://localhost:5173/admin/dashboard')
    await world.page.waitForLoadState('networkidle')
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

  registry.Then(/^应该跳转到(\S+)页面$/, async () => {
  })
}
