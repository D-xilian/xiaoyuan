import { chromium } from '@playwright/test'

class World {
  constructor() {
    this.page = null
    this.browser = null
    this.context = null
    this.scenarioContext = {}
  }

  async init() {
    this.browser = await chromium.launch({ headless: true })
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'zh-CN'
    })
    this.page = await this.context.newPage()
    this.scenarioContext = {}
  }

  async close() {
    if (this.page) await this.page.close()
    if (this.context) await this.context.close()
    if (this.browser) await this.browser.close()
  }

  set(key, value) {
    this.scenarioContext[key] = value
  }

  get(key) {
    return this.scenarioContext[key]
  }
}

export default World
