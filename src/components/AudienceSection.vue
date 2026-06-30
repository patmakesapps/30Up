<script setup lang="ts">
interface Audience {
  title: string
  copy: string
  icon: string
}

const audiences: Audience[] = [
  {
    title: 'Parents',
    copy: 'For school mornings, workdays, practices, errands, and somehow still having plans.',
    icon: '👨‍👩‍👧',
  },
  {
    title: 'Workers',
    copy: 'For long shifts, early starts, late afternoons, and days that do not care how tired you are.',
    icon: '💼',
  },
  {
    title: 'Active Adults',
    copy: 'For workouts, walks, weekend projects, and staying moving without pre-workout chaos.',
    icon: '🏃',
  },
  {
    title: 'Busy Humans',
    copy: 'For anyone 30+ who wants energy that feels a little more grown up.',
    icon: '⏱️',
  },
]
</script>

<template>
  <section class="container-pad py-20">
    <div class="mx-auto max-w-3xl text-center">
      <span class="eyebrow">Who it's for</span>
      <h2 class="section-title mt-3">Made for the 30Up crowd.</h2>
    </div>

    <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <article
        v-for="audience in audiences"
        :key="audience.title"
        class="glass flex flex-col p-7 shadow-card transition-transform duration-200 hover:-translate-y-1"
      >
        <span
          class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-razz-500/20 to-lemon-400/20 text-3xl"
          aria-hidden="true"
        >
          {{ audience.icon }}
        </span>
        <h3 class="text-xl font-bold text-white">{{ audience.title }}</h3>
        <p class="mt-3 text-sm leading-relaxed text-slate-300">{{ audience.copy }}</p>
      </article>
    </div>
  </section>
</template>
