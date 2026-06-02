<script setup>
const guides = [
  {
    title: 'Act 2 Survival',
    kicker: 'Pathing',
    description: 'Enter Act 2 with enough frontload, area coverage, and block density to survive elite pressure.',
  },
  {
    title: 'Boss Preparation',
    kicker: 'Planning',
    description: 'Read the boss icon early and shape your deck around the problem that fight will test.',
  },
  {
    title: 'Scaling Fundamentals',
    kicker: 'Power Curve',
    description: 'Know when a deck needs long-fight scaling instead of another short-term hallway answer.',
  },
  {
    title: 'Block Management',
    kicker: 'Defense',
    description: 'Stop leaking health by balancing proactive damage with reliable defensive turns.',
  },
]
</script>

<template>
  <section class="guides-page">
    <div class="page-heading">
      <p class="eyebrow">Guides</p>
      <h1>Sharper decisions, cleaner climbs.</h1>
      <p>
        A compact guide library for the common run failures SpireInsight diagnoses.
      </p>
    </div>

    <div class="guide-grid">
      <article v-for="guide in guides" :key="guide.title" class="guide-card soft-acrylic">
        <span>{{ guide.kicker }}</span>
        <h2>{{ guide.title }}</h2>
        <p>{{ guide.description }}</p>
      </article>
    </div>
  </section>
</template>

