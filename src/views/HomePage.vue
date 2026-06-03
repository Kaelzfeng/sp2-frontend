<script setup>
import { computed, ref } from 'vue'
import insightArt from '../assets/insight-stack.png'
import { analyzeRun as requestRunAnalysis } from '../services/insightsApi'

const ANALYSIS_DELAY_MS = 260

const characters = [
  { value: 'ironclad', label: 'The Ironclad' },
  { value: 'silent', label: 'The Silent' },
  { value: 'defect', label: 'The Defect' },
  { value: 'watcher', label: 'The Watcher' },
]

const locations = [
  { value: 'act1', label: 'Act 1 Boss' },
  { value: 'act2', label: 'Act 2 Elites' },
  { value: 'act3', label: 'Act 3 Boss' },
  { value: 'heart', label: 'The Heart' },
]

const problems = [
  { value: 'damage', label: 'Lack of Damage' },
  { value: 'block', label: 'Lack of Block' },
  { value: 'scaling', label: 'Poor Scaling' },
  { value: 'draw', label: 'Bad Card Draw' },
]

const selectedCharacter = ref('')
const selectedLocation = ref('')
const selectedProblem = ref('')
const result = ref(null)
const isAnalyzing = ref(false)

const selectedRun = computed(() => ({
  character: selectedCharacter.value,
  location: selectedLocation.value,
  problem: selectedProblem.value,
}))

const canAnalyze = computed(() => (
  Boolean(
    selectedRun.value.character &&
    selectedRun.value.location &&
    selectedRun.value.problem
  )
))

const runLabel = computed(() => [
  findOptionLabel(characters, selectedRun.value.character),
  findOptionLabel(locations, selectedRun.value.location),
  findOptionLabel(problems, selectedRun.value.problem),
].filter(Boolean).join(' / '))

function findOptionLabel(options, value) {
  return options.find((item) => item.value === value)?.label
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function metricWidth(value) {
  return `${Math.max(0, Math.min(value, 100))}%`
}

async function analyzeRun() {
  if (!canAnalyze.value) return

  isAnalyzing.value = true
  await wait(ANALYSIS_DELAY_MS)

  try {
    result.value = await requestRunAnalysis(selectedRun.value)
  } finally {
    isAnalyzing.value = false
  }
}
</script>

<template>
  <div class="home-page">
    <section id="analysis" class="hero-tool">
      <div class="hero-copy">
        <p class="eyebrow">SpireInsight</p>
        <h1>Why Did I Die?</h1>
        <p class="hero-lede">
          Turn a failed Slay the Spire run into a clear next-step diagnosis.
        </p>
        <div class="signal-row" aria-label="Analysis focus areas">
          <span>Damage</span>
          <span>Block</span>
          <span>Scaling</span>
          <span>Draw</span>
        </div>
        <div class="insight-visual" aria-hidden="true">
          <img :src="insightArt" alt="" />
          <div>
            <span>Run readout</span>
            <strong>4 checkpoints scanned</strong>
          </div>
        </div>
      </div>

      <form class="tool-panel soft-acrylic" @submit.prevent="analyzeRun">
        <div class="panel-heading">
          <p class="eyebrow">Run Analysis</p>
          <h2>Select the failure pattern</h2>
          <p>Choose the run context and get a focused diagnosis for the next climb.</p>
        </div>

        <div class="field-grid">
          <label class="field">
            <span>Character</span>
            <select v-model="selectedCharacter" class="select-control">
              <option value="" disabled>Select character</option>
              <option v-for="character in characters" :key="character.value" :value="character.value">
                {{ character.label }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>Death Location</span>
            <select v-model="selectedLocation" class="select-control">
              <option value="" disabled>Select location</option>
              <option v-for="location in locations" :key="location.value" :value="location.value">
                {{ location.label }}
              </option>
            </select>
          </label>

          <label class="field field-wide">
            <span>Main Problem</span>
            <select v-model="selectedProblem" class="select-control">
              <option value="" disabled>Select problem</option>
              <option v-for="problem in problems" :key="problem.value" :value="problem.value">
                {{ problem.label }}
              </option>
            </select>
          </label>
        </div>

        <button class="primary-button" type="submit" :disabled="!canAnalyze || isAnalyzing">
          <span>{{ isAnalyzing ? 'Analyzing' : 'Analyze Run' }}</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </section>

    <section class="result-section" aria-live="polite">
      <div v-if="result" class="result-layout">
        <article class="result-summary soft-acrylic">
          <p class="eyebrow">Diagnostic Result</p>
          <h2>{{ result.title }}</h2>
          <p>{{ runLabel }}</p>
          <div class="confidence">
            <span>Confidence</span>
            <strong>{{ result.confidence }}%</strong>
          </div>
        </article>

        <div class="result-cards">
          <article class="result-card">
            <span>Likely Cause</span>
            <p>{{ result.likelyCause }}</p>
          </article>
          <article class="result-card">
            <span>What Went Wrong</span>
            <p>{{ result.whatWentWrong }}</p>
          </article>
          <article class="result-card">
            <span>Fix Next Run</span>
            <p>{{ result.fixNextRun }}</p>
          </article>
          <article class="result-card">
            <span>Priority Upgrade</span>
            <p>{{ result.priorityUpgrade }}</p>
          </article>
        </div>

        <article class="metrics-card soft-acrylic">
          <div class="metrics-heading">
            <p class="eyebrow">Run Pressure</p>
            <h2>Checkpoint balance</h2>
          </div>
          <div class="metric-list">
            <div v-for="metric in result.metrics" :key="metric.label" class="metric-row">
              <div class="metric-label">
                <span>{{ metric.label }}</span>
                <strong>{{ metric.value }}/{{ metric.target }}</strong>
              </div>
              <div class="metric-track">
                <span class="metric-fill" :style="{ width: metricWidth(metric.value) }"></span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty-state soft-acrylic">
        <p class="eyebrow">Ready when you are</p>
        <h2>No run analyzed yet</h2>
        <p>Select three fields above to generate a focused, readable diagnosis.</p>
      </div>
    </section>
  </div>
</template>
