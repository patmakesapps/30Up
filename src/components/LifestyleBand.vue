<script setup lang="ts">
import fitnessPhoto from '../photos/30up_fitness.png'
</script>

<template>
  <section class="relative isolate overflow-hidden">
    <!-- Full-bleed photo (slightly blurred so overlaid copy stays readable) -->
    <img
      :src="fitnessPhoto"
      alt="30Up shaker bottle with electric-blue Blue Razz Lemonade beside a dumbbell and gym towel"
      class="absolute inset-0 -z-20 h-full w-full scale-105 object-cover blur-[2px]"
      loading="lazy"
    />
    <!-- Legibility scrims (copy lives on the left) -->
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute inset-0 bg-ink-950/55"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/20"></div>
    </div>

    <div class="container-pad relative py-24 sm:py-32">
      <div class="max-w-lg">
        <span class="eyebrow">Energy for your era</span>
        <p class="mt-4 text-3xl font-extrabold leading-tight text-white drop-shadow-md sm:text-4xl">
          For workouts, walks, and weekend projects —
          <span class="text-razz-300">without the pre-workout chaos.</span>
        </p>
        <p class="mt-5 max-w-md text-lg text-slate-100 drop-shadow">
          Mixes clean into water or your shaker. Bright Blue Razz Lemonade,
          built to fit the way grown-ups actually move.
        </p>
      </div>
    </div>
  </section>
</template>
