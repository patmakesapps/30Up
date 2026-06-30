<script setup lang="ts">
// Real product photography (resolved + hashed by Vite at build time)
import heroPhoto from '../photos/30up1.png'
</script>

<template>
  <section id="top" class="relative overflow-hidden">
    <!-- Background gradient accents -->
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-razz-600/25 blur-[120px]"></div>
      <div class="absolute top-20 right-0 h-80 w-80 rounded-full bg-lemon-400/15 blur-[120px]"></div>
    </div>

    <div class="container-pad grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
      <!-- Copy -->
      <div>
        <span class="eyebrow">Energy for adults 30+</span>

        <h1 class="mt-4 text-6xl font-black tracking-tight text-white sm:text-7xl">
          30<span class="text-razz-400">Up</span>
        </h1>

        <p class="mt-4 text-2xl font-bold text-white sm:text-3xl">
          Energy for grown-up life.
        </p>

        <p class="mt-5 max-w-xl text-lg text-slate-300">
          A powdered energy drink mix for adults 30+ — made for work, family,
          workouts, errands, and long days.
        </p>

        <p class="mt-5 inline-flex items-center gap-2 rounded-full border border-razz-500/30 bg-razz-500/10 px-4 py-2 text-sm font-semibold text-razz-400">
          <span class="h-2 w-2 rounded-full bg-razz-400"></span>
          First flavor: Blue Razz Lemonade
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#waitlist" class="btn-primary">Join the First Batch</a>
          <a href="#product" class="btn-secondary">See the Product</a>
        </div>
      </div>

      <!-- Visual -->
      <div class="order-first md:order-last">
        <div class="relative mx-auto w-full max-w-md">
          <!-- Ambient glow behind the photo -->
          <div
            class="absolute -inset-5 -z-10 rounded-[2.5rem] bg-razz-lemon opacity-20 blur-3xl"
            aria-hidden="true"
          ></div>
          <img
            :src="heroPhoto"
            alt="30Up Blue Razz Lemonade — box and stick pack pouring blue powder into a glass of water"
            class="w-full rounded-[2rem] border border-white/15 object-cover shadow-card"
            width="1131"
            height="1414"
            fetchpriority="high"
          />
        </div>
      </div>
    </div>
  </section>
</template>
