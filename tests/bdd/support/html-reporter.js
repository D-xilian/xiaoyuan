import fs from 'fs'
import path from 'path'

export function generateHtmlReport(results, outputPath) {
  const totalScenarios = results.reduce((sum, f) => sum + f.scenarios.length, 0)
  const totalSteps = results.reduce((sum, f) => sum + f.totalSteps, 0)
  const passedSteps = results.reduce((sum, f) => sum + f.passedSteps, 0)
  const failedSteps = results.reduce((sum, f) => sum + f.failedSteps, 0)
  const skippedSteps = results.reduce((sum, f) => sum + f.skippedSteps, 0)
  const totalFeatures = results.length
  const passedFeatures = results.filter(f => f.failedSteps === 0).length
  const passRate = totalSteps > 0 ? ((passedSteps / totalSteps) * 100).toFixed(1) : 0

  const featuresHtml = results.map(feature => {
    const scenariosHtml = (feature.scenarios || []).map(scenario => {
      const stepsHtml = (scenario.steps || []).map(step => {
        const statusClass = step.status === 'passed' ? 'step-passed' :
          step.status === 'failed' ? 'step-failed' : 'step-skipped'
        const statusIcon = step.status === 'passed' ? '✓' :
          step.status === 'failed' ? '✗' : '○'
        const errorHtml = step.error ? `<div class="step-error"><pre>${escapeHtml(step.error)}</pre></div>` : ''
        const screenshotHtml = step.screenshot
          ? `<div class="step-screenshot"><img src="../../${step.screenshot}" alt="失败截图" /></div>`
          : ''
        return `<div class="step ${statusClass}">
          <span class="step-icon">${statusIcon}</span>
          <span class="step-keyword">${step.type}</span>
          <span class="step-text">${escapeHtml(step.text)}</span>
          <span class="step-duration">${step.duration || '0ms'}</span>
          ${errorHtml}
          ${screenshotHtml}
        </div>`
      }).join('')

      const scenarioStatus = scenario.steps.some(s => s.status === 'failed') ? 'scenario-failed' :
        scenario.steps.some(s => s.status === 'skipped') ? 'scenario-skipped' : 'scenario-passed'
      const scenarioIcon = scenario.steps.some(s => s.status === 'failed') ? '✗' : '✓'

      return `<div class="scenario ${scenarioStatus}">
        <div class="scenario-header">
          <span class="scenario-icon">${scenarioIcon}</span>
          <span class="scenario-name">${escapeHtml(scenario.name)}</span>
          <span class="scenario-duration">${scenario.duration || '0ms'}</span>
        </div>
        <div class="steps">${stepsHtml}</div>
      </div>`
    }).join('')

    const featureStatus = feature.failedSteps > 0 ? 'feature-failed' : 'feature-passed'
    return `<div class="feature ${featureStatus}">
      <div class="feature-header">
        <span class="feature-icon">${feature.failedSteps > 0 ? '✗' : '✓'}</span>
        <span class="feature-name">${escapeHtml(feature.name)}</span>
        <span class="feature-source">${feature.source}</span>
        <span class="feature-stats">${feature.passedSteps}/${feature.totalSteps} 步骤通过</span>
      </div>
      <div class="feature-description">${escapeHtml(feature.description || '')}</div>
      ${scenariosHtml}
    </div>`
  }).join('')

  const passedScenarios = results.reduce((sum, f) =>
    sum + (f.scenarios || []).filter(s => !s.steps.some(st => st.status === 'failed')).length, 0)

  const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cucumber BDD 测试报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; color: #333; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 30px; border-radius: 12px; margin-bottom: 24px; }
    .header h1 { font-size: 28px; margin-bottom: 8px; }
    .header .meta { opacity: 0.9; font-size: 14px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .summary-card { background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
    .summary-card .value { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
    .summary-card .label { font-size: 13px; color: #888; }
    .summary-card.pass { border-left: 4px solid #52c41a; }
    .summary-card.fail { border-left: 4px solid #ff4d4f; }
    .summary-card.total { border-left: 4px solid #1890ff; }
    .summary-card.rate { border-left: 4px solid #faad14; }
    .pass .value { color: #52c41a; }
    .fail .value { color: #ff4d4f; }
    .total .value { color: #1890ff; }
    .rate .value { color: #faad14; }
    .feature { background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; overflow: hidden; }
    .feature-header { padding: 16px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
    .feature-passed .feature-header { border-left: 4px solid #52c41a; }
    .feature-failed .feature-header { border-left: 4px solid #ff4d4f; }
    .feature-icon { font-size: 18px; font-weight: bold; }
    .feature-passed .feature-icon { color: #52c41a; }
    .feature-failed .feature-icon { color: #ff4d4f; }
    .feature-name { font-size: 16px; font-weight: 600; flex: 1; }
    .feature-source { font-size: 12px; color: #999; background: #f5f5f5; padding: 2px 8px; border-radius: 4px; }
    .feature-stats { font-size: 13px; color: #666; }
    .feature-description { padding: 8px 20px; color: #888; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
    .scenario { border-bottom: 1px solid #f5f5f5; }
    .scenario:last-child { border-bottom: none; }
    .scenario-header { padding: 12px 20px 12px 40px; display: flex; align-items: center; gap: 10px; }
    .scenario-passed .scenario-icon { color: #52c41a; }
    .scenario-failed .scenario-icon { color: #ff4d4f; }
    .scenario-name { font-size: 14px; font-weight: 500; flex: 1; }
    .scenario-duration { font-size: 12px; color: #999; }
    .steps { padding: 0 20px 8px 56px; }
    .step { padding: 6px 10px; display: flex; align-items: flex-start; gap: 8px; font-size: 13px; border-radius: 4px; margin-bottom: 4px; flex-wrap: wrap; }
    .step-passed { background: #f6ffed; }
    .step-failed { background: #fff2f0; }
    .step-skipped { background: #fafafa; color: #bbb; }
    .step-icon { font-weight: bold; }
    .step-passed .step-icon { color: #52c41a; }
    .step-failed .step-icon { color: #ff4d4f; }
    .step-keyword { color: #1890ff; font-weight: 500; min-width: 50px; }
    .step-text { flex: 1; }
    .step-duration { color: #999; font-size: 11px; white-space: nowrap; }
    .step-error { width: 100%; margin-top: 4px; }
    .step-error pre { background: #fff1f0; border: 1px solid #ffa39e; border-radius: 4px; padding: 8px; font-size: 12px; overflow-x: auto; color: #cf1322; max-height: 200px; }
    .step-screenshot { width: 100%; margin-top: 8px; }
    .step-screenshot img { max-width: 100%; max-height: 400px; border: 1px solid #e8e8e8; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Cucumber BDD 自动化测试报告</h1>
      <div class="meta">校园活动管理系统 · 执行时间: ${timestamp}</div>
    </div>

    <div class="summary">
      <div class="summary-card total">
        <div class="value">${totalFeatures}</div>
        <div class="label">特性总数</div>
      </div>
      <div class="summary-card pass">
        <div class="value">${passedScenarios}</div>
        <div class="label">通过场景</div>
      </div>
      <div class="summary-card fail">
        <div class="value">${totalScenarios - passedScenarios}</div>
        <div class="label">失败场景</div>
      </div>
      <div class="summary-card total">
        <div class="value">${totalSteps}</div>
        <div class="label">步骤总数</div>
      </div>
      <div class="summary-card pass">
        <div class="value">${passedSteps}</div>
        <div class="label">通过步骤</div>
      </div>
      <div class="summary-card fail">
        <div class="value">${failedSteps}</div>
        <div class="label">失败步骤</div>
      </div>
      <div class="summary-card rate">
        <div class="value">${passRate}%</div>
        <div class="label">通过率</div>
      </div>
    </div>

    ${featuresHtml}

    <div class="footer">Cucumber BDD Framework · Playwright Automation · 课程设计报告 ${timestamp}</div>
  </div>
</body>
</html>`

  const absolutePath = path.resolve(outputPath, 'cucumber-report.html')
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true })
  fs.writeFileSync(absolutePath, html, 'utf-8')
  console.log(`\n[HTML报告] 已生成: ${absolutePath}`)
  return absolutePath
}

function escapeHtml(text) {
  if (!text) return ''
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}
