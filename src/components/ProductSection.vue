<script setup lang="ts">
import productPhoto from '../photos/package_01.webp'

interface Feature {
  title: string
  icon: string
}

// Reusable feature card data ("planned" used where formula details could change)
const features: Feature[] = [
  { title: 'Adult energy drink mix', icon: '⚡' },
  { title: 'Caffeine + electrolytes + B vitamins', icon: '🧪' },
  { title: 'Zero sugar planned', icon: '🚫' },
  { title: 'No artificial dyes planned', icon: '🎨' },
  { title: 'Portable powder format', icon: '🎒' },
  { title: 'Built for long days', icon: '🌙' },
]
</script>

<template>
  <section id="product" class="container-pad py-20">
    <div class="mx-auto max-w-3xl text-center">
      <span class="eyebrow">The Product</span>
      <h2 class="section-title mt-3">First up: Blue Razz Lemonade.</h2>
      <p class="mt-6 text-lg text-slate-300">
        30Up Blue Razz Lemonade is the first planned flavor: a bright blue
        raspberry lemonade energy powder designed to mix with water and fit into
        your day without the canned chaos.
      </p>
    </div>

    <div class="mt-12 grid items-center gap-10 lg:grid-cols-2">
      <!-- Lifestyle photo -->
      <div class="relative mx-auto w-full max-w-md">
        <div
          class="absolute -inset-5 -z-10 rounded-[2.5rem] bg-razz-lemon opacity-15 blur-3xl"
          aria-hidden="true"
        ></div>
        <img
          :src="productPhoto"
          alt="30Up Blue Razz Lemonade box of 10 single-serve sticks with a stick pack"
          class="w-full rounded-[2rem] border border-white/10 object-cover shadow-card"
          width="1448"
          height="1086"
          loading="lazy"
        />
      </div>

      <!-- Feature cards -->
      <ul class="grid gap-4 sm:grid-cols-2">
        <li
          v-for="feature in features"
          :key="feature.title"
          class="glass flex items-center gap-4 p-6 transition-transform duration-200 hover:-translate-y-1"
        >
          <span
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-razz-500/15 text-2xl"
            aria-hidden="true"
          >
            {{ feature.icon }}
          </span>
          <span class="text-base font-semibold text-white">{{ feature.title }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
