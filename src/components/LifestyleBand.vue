<script setup lang="ts">
import pourPhoto from '../photos/30up_pour_01.png'
</script>

<template>
  <section class="relative isolate overflow-hidden">
    <!-- Full-bleed photo -->
    <img
      :src="pourPhoto"
      alt="A 30Up Blue Razz Lemonade stick pack being poured into a water bottle"
      class="absolute inset-0 -z-20 h-full w-full object-cover"
      loading="lazy"
    />
    <!-- Legibility scrims (copy lives on the left) -->
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute inset-0 bg-ink-950/45"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-transparent"></div>
    </div>

    <div class="container-pad relative py-24 sm:py-32">
      <div class="max-w-xl">
        <span class="eyebrow">Just add water</span>
        <p class="mt-4 text-3xl font-extrabold leading-tight text-white drop-shadow sm:text-4xl">
          Mixes clean into water or your shaker —
          <span class="text-razz-400">no canned chaos.</span>
        </p>
        <p class="mt-5 max-w-md text-lg text-slate-200">
          A portable powder built for early mornings, long shifts, and the second
          half of the day. Bright Blue Razz Lemonade, made for the way grown-ups
          actually move.
        </p>
      </div>
    </div>
  </section>
</template>
