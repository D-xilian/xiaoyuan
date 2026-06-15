class StepRegistry {
  constructor() {
    this.givenSteps = []
    this.whenSteps = []
    this.thenSteps = []
  }

  Given(pattern, fn) {
    this.givenSteps.push({ pattern, fn })
  }

  When(pattern, fn) {
    this.whenSteps.push({ pattern, fn })
  }

  Then(pattern, fn) {
    this.thenSteps.push({ pattern, fn })
  }

  And(pattern, fn) {
    this.givenSteps.push({ pattern, fn })
    this.whenSteps.push({ pattern, fn })
    this.thenSteps.push({ pattern, fn })
  }

  But(pattern, fn) {
    this.givenSteps.push({ pattern, fn })
    this.whenSteps.push({ pattern, fn })
    this.thenSteps.push({ pattern, fn })
  }

  findMatchingStep(stepType, stepText) {
    const registry = this[`${stepType.toLowerCase()}Steps`]
    if (!registry) return null

    for (const step of registry) {
      const match = stepText.match(step.pattern)
      if (match) {
        return { fn: step.fn, args: match.slice(1) }
      }
    }
    return null
  }
}

export default StepRegistry
