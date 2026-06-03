const FALLBACK_RESULT = {
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

const LOCAL_INSIGHTS_URL = '/data/run_insights.json'
const INSIGHTS_API_MODE = import.meta.env.VITE_INSIGHTS_API_MODE
const INSIGHTS_API_URL = import.meta.env.VITE_INSIGHTS_API_URL

let insightsCache = null

function shouldUseRemoteInsights() {
  return INSIGHTS_API_MODE === 'remote'
}

async function fetchInsights(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Could not load insights data: ${response.status}`)
  }

  return response.json()
}

async function loadLocalInsights() {
  try {
    return await fetchInsights(LOCAL_INSIGHTS_URL)
  } catch {
    return { entries: [FALLBACK_RESULT] }
  }
}

async function loadRemoteInsights() {
  if (!INSIGHTS_API_URL) {
    throw new Error('VITE_INSIGHTS_API_URL is required for remote insights mode.')
  }

  return fetchInsights(INSIGHTS_API_URL)
}

async function loadRemoteInsightsWithLocalFallback() {
  try {
    return await loadRemoteInsights()
  } catch {
    return loadLocalInsights()
  }
}

function findMatchingInsight(entries, { character, location, problem }) {
  return entries.find((entry) => (
    entry.character === character &&
    entry.location === location &&
    entry.problem === problem
  ))
}

function findFallbackInsight(entries) {
  return entries.find((entry) => entry.id === 'default') || FALLBACK_RESULT
}

export async function loadInsights() {
  if (!insightsCache) {
    insightsCache = shouldUseRemoteInsights()
      ? await loadRemoteInsightsWithLocalFallback()
      : await loadLocalInsights()
  }

  return insightsCache
}

export async function analyzeRun({ character, location, problem }) {
  const insights = await loadInsights()
  const entries = insights.entries || []

  return (
    findMatchingInsight(entries, { character, location, problem }) ||
    findFallbackInsight(entries)
  )
}
