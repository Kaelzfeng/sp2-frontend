<script setup>
import { computed, onMounted, ref } from 'vue'
import insightArt from '../assets/insight-stack.png'

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

const fallbackResult = {
  id: 'fallback',
  title: 'Your deck missed a core checkpoint.',
  likelyCause: 'The run was short on one key axis for the fight you reached.',
  whatWentWrong: 'Your deck likely solved some hallway fights, but it did not convert that strength into a reliable plan for the next pressure spike.',
  fixNextRun: 'Take cards and relics that solve the upcoming Act instead of only improving the current floor.',
  priorityUpgrade: 'Add one consistent source of damage, block, scaling, or draw before the next elite path.',
  confidence: 72,
  metrics: [
    { label: 'Damage', value: 58, target: 70 },
    { label: 'Block', value: 54, target: 70 },
    { label: 'Scaling', value: 48, target: 70 },
    { label: 'Draw', value: 52, target: 70 },
  ],
}

const selectedCharacter = ref('')
const selectedLocation = ref('')
const selectedProblem = ref('')
const result = ref(null)
const insights = ref({ entries: [] })
const isAnalyzing = ref(false)

const canAnalyze = computed(() => (
  selectedCharacter.value &&
  selectedLocation.value &&
  selectedProblem.value
))

const runLabel = computed(() => {
  const character = characters.find((item) => item.value === selectedCharacter.value)?.label
  const location = locations.find((item) => item.value === selectedLocation.value)?.label
  const problem = problems.find((item) => item.value === selectedProblem.value)?.label

  return [character, location, problem].filter(Boolean).join(' / ')
})

function metricWidth(value) {
  return `${Math.max(0, Math.min(value, 100))}%`
}

function findInsight() {
  const entries = insights.value.entries || []
  const exact = entries.find((entry) => (
    entry.character === selectedCharacter.value &&
    entry.location === selectedLocation.value &&
    entry.problem === selectedProblem.value
  ))
  const byProblem = entries.find((entry) => entry.problem === selectedProblem.value)
  const defaultEntry = entries.find((entry) => entry.id === 'default')

  return exact || byProblem || defaultEntry || fallbackResult
}

function analyzeRun() {
  if (!canAnalyze.value) return

  isAnalyzing.value = true
  window.setTimeout(() => {
    result.value = findInsight()
    isAnalyzing.value = false
  }, 260)
}

onMounted(async () => {
  try {
    const response = await fetch('/data/run_insights.json')
    insights.value = await response.json()
  } catch {
    insights.value = { entries: [fallbackResult] }
  }
})
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
