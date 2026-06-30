<script setup lang="ts">
const ingredients = [
  'Moderate caffeine',
  'Electrolytes',
  'B vitamins',
  'L-theanine, if feasible',
  'Zero sugar',
  'No artificial dyes',
]
</script>

<template>
  <section class="relative py-20">
    <div class="container-pad">
      <div class="glass overflow-hidden p-8 shadow-card sm:p-12">
        <div class="mx-auto max-w-3xl text-center">
          <span class="eyebrow">In development</span>
          <h2 class="section-title mt-3">Planned formula direction.</h2>
          <p class="mt-6 text-lg text-slate-300">
            We're currently exploring a formula direction built around useful
            adult energy support, hydration support, and flavor that does not
            taste like a melted gas-station slushie.
          </p>
        </div>

        <ul class="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          <li
            v-for="item in ingredients"
            :key="item"
            class="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-700/50 px-5 py-4"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-razz-500/20 text-razz-400"
              aria-hidden="true"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clip-rule="evenodd" />
              </svg>
            </span>
            <span class="text-base font-medium text-white">{{ item }}</span>
          </li>
        </ul>

        <p
          class="mx-auto mt-10 max-w-2xl rounded-2xl border border-lemon-400/20 bg-lemon-400/5 px-6 py-4 text-center text-sm text-slate-300"
        >
          <strong class="font-semibold text-lemon-300">Please note:</strong>
          Final formula, caffeine amount, ingredients, packaging, and claims are
          subject to change before launch.
        </p>
      </div>
    </div>
  </section>
</template>
