<script setup lang="ts">
import { RouterLink } from 'vue-router'
// Real product photography (resolved + hashed by Vite at build time)
import heroPhoto from '../photos/package_01.png'
import waterPhoto from '../photos/30up_water_close_up.png'
</script>

<template>
  <section id="top" class="relative overflow-hidden">
    <!-- Background: faint blue-water macro + gradient accents -->
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <img
        :src="waterPhoto"
        alt=""
        class="absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full object-cover opacity-20 blur-2xl"
      />
      <div class="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-razz-600/20 blur-[120px]"></div>
      <div class="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-lemon-400/10 blur-[120px]"></div>
    </div>

    <div class="container-pad grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
      <!-- Copy -->
      <div>
        <span class="eyebrow">Energy for adults 30+</span>

        <h1 class="mt-4 text-6xl font-black leading-none tracking-tight text-white sm:text-7xl">
          <span class="wordmark">30<span class="up">UP</span></span>
        </h1>

        <p class="mt-5 text-2xl font-bold text-white sm:text-3xl">
          Energy for grown-up life.
        </p>

        <p class="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
          A powdered energy drink mix for adults 30+ — made for work, family,
          workouts, errands, and long days.
        </p>

        <p
          class="mt-6 inline-flex items-center gap-2 rounded-full border border-razz-500/30 bg-razz-500/10 px-4 py-2 text-sm font-semibold text-razz-300"
        >
          <span class="h-2 w-2 rounded-full bg-razz-400"></span>
          First flavor: Blue Razz Lemonade
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <RouterLink :to="{ path: '/', hash: '#waitlist' }" class="btn-primary">
            Join the First Batch
          </RouterLink>
          <RouterLink :to="{ path: '/', hash: '#product' }" class="btn-secondary">
            See the Product
          </RouterLink>
        </div>

        <!-- Trust row -->
        <div class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-wider text-slate-400">
          <span>Zero Sugar</span>
          <span class="text-white/20">•</span>
          <span>No Artificial Dyes</span>
          <span class="text-white/20">•</span>
          <span>Caffeine · Electrolytes · B Vitamins</span>
        </div>
      </div>

      <!-- Visual -->
      <div class="order-first md:order-last">
        <div class="relative mx-auto w-full max-w-lg">
          <div
            class="absolute -inset-6 -z-10 rounded-[2.5rem] bg-razz-lemon opacity-25 blur-3xl"
            aria-hidden="true"
          ></div>
          <img
            :src="heroPhoto"
            alt="30Up Blue Razz Lemonade — box of 10 single-serve sticks with a stick pack"
            class="w-full rounded-[2rem] border border-white/10 object-cover shadow-card"
            width="1456"
            height="1092"
            fetchpriority="high"
          />
        </div>
      </div>
    </div>
  </section>
</template>
