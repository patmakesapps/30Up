<script setup lang="ts">
import { RouterLink } from 'vue-router'
import heroPhoto from '../photos/30up_fitness.png'
import logoMark from '../photos/logo-mark.png'
</script>

<template>
  <section id="top" class="relative isolate overflow-hidden">
    <!-- Full-bleed background photo -->
    <img
      :src="heroPhoto"
      alt=""
      class="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      fetchpriority="high"
    />
    <!-- Legibility scrims: strong on the left where the copy sits, plus a base darken -->
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute inset-0 bg-ink-950/55"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40"></div>
    </div>

    <div class="container-pad flex min-h-[88vh] items-center py-20">
      <div class="max-w-xl">
        <span class="eyebrow">Energy for adults 30+</span>

        <!-- Brand logo as the hero lockup -->
        <img
          :src="logoMark"
          alt="30Up"
          class="mt-5 w-64 sm:w-80"
          width="854"
          height="326"
        />

        <p class="mt-6 text-3xl font-bold text-white drop-shadow sm:text-4xl">
          Energy for grown-up life.
        </p>

        <p class="mt-5 max-w-lg text-lg leading-relaxed text-slate-200">
          A powdered energy drink mix for adults 30+ — made for work, family,
          workouts, errands, and long days.
        </p>

        <p
          class="mt-6 inline-flex items-center gap-2 rounded-full border border-razz-400/40 bg-ink-950/70 px-4 py-2 text-sm font-semibold text-razz-300 backdrop-blur-sm"
        >
          <span class="h-2 w-2 rounded-full bg-razz-400"></span>
          First flavor: Blue Razz Lemonade
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <RouterLink :to="{ path: '/', hash: '#waitlist' }" class="btn-primary">
            Join the First Batch
          </RouterLink>
          <RouterLink :to="{ path: '/', hash: '#product' }" class="btn-secondary backdrop-blur-sm">
            See the Product
          </RouterLink>
        </div>

        <div class="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <span>Zero Sugar</span>
          <span class="text-white/25">•</span>
          <span>No Artificial Dyes</span>
          <span class="text-white/25">•</span>
          <span>Caffeine · Electrolytes · B Vitamins</span>
        </div>
      </div>
    </div>
  </section>
</template>
