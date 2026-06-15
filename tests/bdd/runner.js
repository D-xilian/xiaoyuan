import path from 'path'
import { fileURLToPath } from 'url'
import { expect } from '@playwright/test'
import World from './support/world.js'
import StepRegistry from './support/step-registry.js'
import { loadAllFeatures } from './support/gherkin-parser.js'
import { generateHtmlReport } from './support/html-reporter.js'
import { registerAuthSteps } from './step_definitions/authentication-steps.js'
import { registerActivitySteps } from './step_definitions/activity-management-steps.js'
import { registerRegistrationSteps } from './step_definitions/registration-steps.js'
import { registerAdminSteps } from './step_definitions/admin-steps.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FEATURES_DIR = path.resolve(__dirname, 'features')
const REPORT_DIR = path.resolve(__dirname, 'report')
const SCREENSHOTS_DIR = path.resolve(__dirname, 'screenshots')

async function runBddTests(options = {}) {
  const {
    featureFilter = null,
    tagFilter = null,
    headless = true,
    baseUrl = 'http://localhost:5173'
  } = options

  console.log('')
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║    Cucumber BDD Test Runner - 校园活动管理系统       ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log(`   Base URL: ${baseUrl}`)
  console.log(`   Headless: ${headless}`)
  if (featureFilter) console.log(`   Feature Filter: ${featureFilter}`)
  if (tagFilter) console.log(`   Tag Filter: ${tagFilter}`)
  console.log('')

  const features = loadAllFeatures(FEATURES_DIR)

  const filteredFeatures = features.filter(f => {
    if (featureFilter && !f.source.includes(featureFilter)) return false
    if (tagFilter) {
      const allTags = (f.tags || []).concat(...f.scenarios.map(s => s.tags || []))
      const tags = tagFilter.split(',')
      return tags.some(t => allTags.includes(t.trim()))
    }
    return true
  })

  if (filteredFeatures.length === 0) {
    console.log('  没有匹配的特性文件。')
    return
  }

  const allResults = []

  for (const feature of filteredFeatures) {
    const featureResult = {
      name: feature.name,
      description: feature.description,
      source: feature.source,
      scenarios: [],
      totalSteps: 0,
      passedSteps: 0,
      failedSteps: 0,
      skippedSteps: 0
    }

    console.log(`\n  Feature: ${feature.name} (${feature.source})`)

    for (const scenario of feature.scenarios) {
      const world = new World()
      const registry = new StepRegistry()

      registerAuthSteps(registry, world, { expect })
      registerActivitySteps(registry, world, { expect })
      registerRegistrationSteps(registry, world, { expect })
      registerAdminSteps(registry, world, { expect })

      const scenarioResult = {
        name: scenario.name,
        steps: [],
        duration: '0ms'
      }

      console.log(`\n    Scenario: ${scenario.name}`)

      let scenarioFailed = false
      const scenarioStart = Date.now()

      try {
        await world.init()

        const allSteps = [
          ...(feature.background ? feature.background.steps.map(s => ({ ...s, isBackground: true })) : []),
          ...scenario.steps.map(s => ({ ...s, isBackground: false }))
        ]

        for (const step of allSteps) {
          let effectiveType = step.type
          if (effectiveType === 'And' || effectiveType === 'But') {
            if (scenarioResult.steps.length > 0) {
              const lastStep = scenarioResult.steps[scenarioResult.steps.length - 1]
              const typeOrder = { 'Given': 'Given', 'When': 'When', 'Then': 'Then' }
              effectiveType = lastStep.type === 'Given' ? 'Given' :
                lastStep.type === 'When' ? 'When' : 'Then'
            } else {
              effectiveType = 'Given'
            }
          }

          const stepStart = Date.now()
          const stepResult = {
            type: effectiveType,
            text: step.text,
            status: 'skipped',
            duration: '0ms'
          }

          const match = registry.findMatchingStep(effectiveType, step.text)
          if (match && !scenarioFailed) {
            try {
              await match.fn(...match.args)
              stepResult.status = 'passed'
              featureResult.passedSteps++
              console.log(`      ✓ ${step.type} ${step.text}`)
            } catch (err) {
              stepResult.status = 'failed'
              stepResult.error = err.message || String(err)
              scenarioFailed = true
              featureResult.failedSteps++

              const screenshotPath = path.join(SCREENSHOTS_DIR,
                `${feature.source.replace('.feature', '')}_${scenario.name.replace(/\s+/g, '_')}_${step.type}_${Date.now()}.png`)
              try {
                await world.page.screenshot({ path: screenshotPath, fullPage: true })
                stepResult.screenshot = path.relative(path.resolve(__dirname, '..'), screenshotPath)
                console.log(`      [截图已保存] ${screenshotPath}`)
              } catch { }

              console.log(`      ✗ ${step.type} ${step.text}`)
              console.log(`        Error: ${err.message}`)
            }
          } else if (scenarioFailed) {
            stepResult.status = 'skipped'
            featureResult.skippedSteps++
            console.log(`      ○ ${step.type} ${step.text} (跳过)`)
          } else {
            console.log(`      ! ${step.type} ${step.text} (未找到匹配的步骤定义)`)
            stepResult.status = 'failed'
            stepResult.error = `未找到匹配的步骤定义: ${effectiveType} ${step.text}`
            scenarioFailed = true
            featureResult.failedSteps++
          }

          stepResult.duration = `${Date.now() - stepStart}ms`
          scenarioResult.steps.push(stepResult)
          featureResult.totalSteps++
        }

        scenarioResult.duration = `${Date.now() - scenarioStart}ms`
        scenarioResult.status = scenarioFailed ? 'failed' : 'passed'
        featureResult.scenarios.push(scenarioResult)

        if (scenarioFailed) {
          console.log(`    Result: ✗ 失败 (${scenarioResult.duration})`)
        } else {
          console.log(`    Result: ✓ 通过 (${scenarioResult.duration})`)
        }

      } catch (err) {
        console.log(`    Scenario Error: ${err.message}`)
      } finally {
        await world.close()
      }
    }

    allResults.push(featureResult)
    const passPercent = featureResult.totalSteps > 0
      ? ((featureResult.passedSteps / featureResult.totalSteps) * 100).toFixed(1)
      : 0
    console.log(`\n  Feature Summary: ${featureResult.passedSteps}/${featureResult.totalSteps} steps passed (${passPercent}%)`)
  }

  console.log('\n' + '='.repeat(60))
  const totalScenarios = allResults.reduce((s, f) => s + f.scenarios.length, 0)
  const totalSteps = allResults.reduce((s, f) => s + f.totalSteps, 0)
  const passedSteps = allResults.reduce((s, f) => s + f.passedSteps, 0)
  const failedSteps = allResults.reduce((s, f) => s + f.failedSteps, 0)
  const totalPassPercent = totalSteps > 0 ? ((passedSteps / totalSteps) * 100).toFixed(1) : 0
  console.log(`  Total: ${totalScenarios} scenarios, ${totalSteps} steps`)
  console.log(`  Passed: ${passedSteps}, Failed: ${failedSteps}`)
  console.log(`  Pass Rate: ${totalPassPercent}%`)

  const reportPath = generateHtmlReport(allResults, REPORT_DIR)
  console.log(`  报告已生成: ${reportPath}`)
  console.log('')

  return { allResults, reportPath }
}

runBddTests().catch(err => {
  console.error('BDD测试运行失败:', err)
  process.exit(1)
})
