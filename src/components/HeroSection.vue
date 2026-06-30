<script setup lang="ts">
import { RouterLink } from 'vue-router'
import heroPhoto from '../photos/30up_water_close_up.png'
import logoMark from '../photos/logo-mark.png'
</script>

<template>
  <section id="top" class="relative isolate overflow-hidden">
    <!-- Full-bleed background photo (blurred for a soft, premium effect) -->
    <img
      :src="heroPhoto"
      alt=""
      class="absolute inset-0 -z-20 h-full w-full scale-110 object-cover object-center blur-[6px]"
      fetchpriority="high"
    />
    <!-- Legibility scrims: flat darken + centered radial so the logo/copy stay crisp -->
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute inset-0 bg-ink-950/70"></div>
      <div class="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_44%,rgba(4,6,10,0.7),transparent_72%)]"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/55"></div>
    </div>

    <div class="container-pad flex min-h-[88vh] items-center justify-center py-20 text-center">
      <div class="mx-auto flex max-w-2xl flex-col items-center">
        <span class="eyebrow">Energy for adults 30+</span>

        <!-- Brand logo as the hero lockup (dark halo keeps the blue "UP" crisp) -->
        <img
          :src="logoMark"
          alt="30Up"
          class="mt-5 w-64 [filter:drop-shadow(0_0_5px_rgba(4,6,10,0.95))_drop-shadow(0_4px_16px_rgba(4,6,10,0.75))] sm:w-80"
          width="854"
          height="326"
        />

        <h1 class="mt-6 text-3xl font-bold text-white drop-shadow-md sm:text-4xl">
          Energy for grown-up life.
        </h1>

        <p class="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-100 drop-shadow">
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

        <div class="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-wider text-slate-200">
          <span>Zero Sugar</span>
          <span class="text-white/30">•</span>
          <span>No Artificial Dyes</span>
          <span class="text-white/30">•</span>
          <span>Caffeine · Electrolytes · B Vitamins</span>
        </div>
      </div>
    </div>
  </section>
</template>
