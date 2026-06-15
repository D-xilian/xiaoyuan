import fs from 'fs'
import path from 'path'

class ScenarioOutline {
  constructor(template, examples) {
    this.template = template
    this.examples = examples
  }
}

export function parseFeatureFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  return parseFeature(content, path.basename(filePath))
}

export function parseFeature(content, source = 'unknown') {
  const lines = content.split('\n')
  const feature = {
    name: '',
    description: '',
    scenarios: [],
    source
  }

  let currentScenario = null
  let currentStepType = null
  let scenarioOutline = null
  let examplesTable = null
  let inBackground = false
  let background = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) continue

    if (trimmed.startsWith('Feature:')) {
      feature.name = trimmed.replace('Feature:', '').trim()
      let j = i + 1
      while (j < lines.length && lines[j].trim() && !lines[j].trim().startsWith('Scenario') && !lines[j].trim().startsWith('Background') && !lines[j].trim().startsWith('@')) {
        if (lines[j].trim()) {
          feature.description += (feature.description ? ' ' : '') + lines[j].trim()
        }
        j++
      }
      continue
    }

    if (trimmed.startsWith('Background:')) {
      inBackground = true
      background = { steps: [] }
      continue
    }

    if (trimmed.startsWith('@')) {
      if (currentScenario) {
        currentScenario.tags = trimmed.split(/\s+/).filter(t => t.startsWith('@'))
      } else {
        feature.tags = trimmed.split(/\s+/).filter(t => t.startsWith('@'))
      }
      continue
    }

    if (trimmed.startsWith('Scenario Outline:') || trimmed.startsWith('Scenario Template:')) {
      if (currentScenario && scenarioOutline) {
        expandOutlineScenarios(feature, currentScenario)
      }
      currentScenario = {
        name: trimmed.replace(/^(Scenario Outline:|Scenario Template:)/, '').trim(),
        steps: [],
        tags: [],
        examples: []
      }
      scenarioOutline = true
      examplesTable = null
      inBackground = false
      continue
    }

    if (trimmed.startsWith('Scenario:')) {
      if (currentScenario && scenarioOutline) {
        expandOutlineScenarios(feature, currentScenario)
      }
      currentScenario = {
        name: trimmed.replace('Scenario:', '').trim(),
        steps: [],
        tags: []
      }
      scenarioOutline = false
      examplesTable = null
      inBackground = false
      continue
    }

    if (trimmed === 'Examples:' || trimmed === 'Scenarios:') {
      examplesTable = { headers: [], rows: [] }
      continue
    }

    if (examplesTable) {
      if (trimmed.startsWith('|')) {
        const cells = parseTableRow(trimmed)
        if (examplesTable.headers.length === 0) {
          examplesTable.headers = cells
        } else {
          examplesTable.rows.push(cells)
        }
      } else {
        if (currentScenario && scenarioOutline) {
          currentScenario.examples = examplesTable
        }
        examplesTable = null
      }
      continue
    }

    const stepMatch = trimmed.match(/^(Given|When|Then|And|But)\s+(.+)/)
    if (stepMatch) {
      const step = { type: stepMatch[1], text: stepMatch[2], line: i + 1 }
      if (trimmed.startsWith('|')) {
        step.table = parseTableRow(trimmed)
      }
      const docstringMatch = getDocstring(lines, i + 1)
      if (docstringMatch) {
        step.docstring = docstringMatch.content
        i = docstringMatch.endLine
      }
      if (inBackground && background) {
        background.steps.push(step)
      } else if (currentScenario) {
        currentScenario.steps.push(step)
      }
      continue
    }
  }

  if (currentScenario && scenarioOutline) {
    expandOutlineScenarios(feature, currentScenario)
  }

  if (background) {
    feature.background = background
  }

  return feature
}

function parseTableRow(line) {
  return line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
}

function getDocstring(lines, startLine) {
  for (let i = startLine; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (trimmed === '"""' || trimmed === "'''") {
      let content = ''
      let j = i + 1
      while (j < lines.length && lines[j].trim() !== '"""' && lines[j].trim() !== "'''") {
        content += (content ? '\n' : '') + lines[j]
        j++
      }
      return { content, endLine: j }
    }
  }
  return null
}

function expandOutlineScenarios(feature, outline) {
  if (!outline.examples || !outline.examples.headers.length) {
    feature.scenarios.push(outline)
    return
  }

  const { headers, rows } = outline.examples
  for (const rowValues of rows) {
    const vars = {}
    headers.forEach((h, idx) => { vars[h.trim()] = rowValues[idx] })

    const scenario = {
      name: replacePlaceholders(outline.name, vars),
      steps: outline.steps.map(s => ({
        ...s,
        text: replacePlaceholders(s.text, vars),
        table: s.table ? s.table.map(cell => replacePlaceholders(cell, vars)) : undefined
      })),
      tags: [...outline.tags]
    }
    feature.scenarios.push(scenario)
  }
}

function replacePlaceholders(text, vars) {
  return text.replace(/<([^>]+)>/g, (_, key) => vars[key.trim()] || `<${key}>`)
}

export function getScenarioFullName(scenario) {
  return scenario.name
}

export function loadAllFeatures(featuresDir) {
  const files = fs.readdirSync(featuresDir).filter(f => f.endsWith('.feature'))
  return files.map(f => parseFeatureFile(path.join(featuresDir, f)))
}
