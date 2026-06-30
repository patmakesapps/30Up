<script setup lang="ts">
import fitnessPhoto from '../photos/30up_fitness.png'
</script>

<template>
  <section class="relative overflow-hidden">
    <!-- Full-bleed photo -->
    <img
      :src="fitnessPhoto"
      alt="30Up shaker bottle with electric-blue Blue Razz Lemonade beside a dumbbell and gym towel"
      class="absolute inset-0 h-full w-full object-cover"
      width="1456"
      height="1092"
      loading="lazy"
    />
    <!-- Readability gradient -->
    <div
      class="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/30"
      aria-hidden="true"
    ></div>

    <div class="container-pad relative py-24 sm:py-32">
      <div class="max-w-xl">
        <span class="eyebrow">Energy for your era</span>
        <p class="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
          For workouts, walks, and weekend projects —
          <span class="bg-razz-lemon bg-clip-text text-transparent">
            without the pre-workout chaos.
          </span>
        </p>
        <p class="mt-5 max-w-md text-lg text-slate-300">
          Mixes clean into water or your shaker. Bright Blue Razz Lemonade,
          built to fit the way grown-ups actually move.
        </p>
      </div>
    </div>
  </section>
</template>
