<script setup lang="ts">
import powderPhoto from '../photos/30up_powder_close_up.webp'

interface Ingredient {
  name: string
  benefit: string
}

// Per serving. Zero sugar, no artificial dyes.
const ingredients: Ingredient[] = [
  {
    name: '~150mg natural caffeine + ~200mg L-theanine',
    benefit: 'Smooth, focused energy, with no jitters or crash.',
  },
  {
    name: '3g creatine monohydrate',
    benefit:
      'Strength, recovery, and cognitive support: the ingredient your body needs more of after 30.',
  },
  {
    name: 'Real electrolytes (sodium, potassium, magnesium)',
    benefit: 'Hydration for long days and workouts.',
  },
  {
    name: 'Methylated B-complex',
    benefit: 'Real cellular energy.',
  },
  {
    name: 'Naturally colored with blue spirulina',
    benefit: 'No artificial dyes.',
  },
]
</script>

<template>
  <section id="formula" class="relative py-20">
    <div class="container-pad">
      <div class="glass grid items-center gap-10 overflow-hidden p-8 shadow-card sm:p-12 lg:grid-cols-2">
        <!-- Powder macro photo -->
        <div class="relative order-last lg:order-first">
          <div
            class="absolute -inset-4 -z-10 rounded-[2.5rem] bg-razz-600/20 blur-3xl"
            aria-hidden="true"
          ></div>
          <img
            :src="powderPhoto"
            alt="Close-up of 30Up Blue Razz Lemonade powder pouring from a stick pack"
            class="w-full rounded-[1.75rem] border border-white/10 object-cover shadow-card"
            width="1456"
            height="1092"
            loading="lazy"
          />
        </div>

        <div>
          <span class="eyebrow">What's inside</span>
          <h2 class="section-title mt-3">What's inside every serving.</h2>
          <p class="mt-6 text-lg leading-relaxed text-slate-300">
            This is the formula we're dialing in for the first batch: zero sugar,
            no artificial dyes, built around smooth energy, real hydration, and a
            healthy-aging ingredient your body needs more of after 30.
          </p>

          <ul class="mt-8 grid gap-3">
            <li
              v-for="item in ingredients"
              :key="item.name"
              class="flex items-start gap-3 rounded-2xl border border-white/10 bg-ink-700/50 px-5 py-4"
            >
              <span
                class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-razz-500/20 text-razz-400"
                aria-hidden="true"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clip-rule="evenodd" />
                </svg>
              </span>
              <span class="text-base">
                <span class="font-semibold text-white">{{ item.name }}</span>
                <span class="mt-1 block text-sm leading-relaxed text-slate-300">{{ item.benefit }}</span>
              </span>
            </li>
          </ul>

          <p
            class="mt-8 rounded-2xl border border-lemon-400/20 bg-lemon-400/5 px-6 py-4 text-sm text-slate-300"
          >
            <strong class="font-semibold text-lemon-300">Heads up:</strong>
            30Up is still in development. Final formula, ingredient amounts, and
            packaging are subject to change before launch.
          </p>

          <p
            class="mt-4 rounded-2xl border border-white/10 bg-ink-700/40 px-6 py-4 text-xs leading-relaxed text-slate-400"
          >
            These statements have not been evaluated by the FDA. This product is
            not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
