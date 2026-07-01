<script setup lang="ts">
interface Contrast {
  title: string
  copy: string
  icon: 'cup' | 'controller' | 'drop'
}

// What everyone else is really selling, and why it misses adults 30+.
const contrasts: Contrast[] = [
  {
    title: 'Sugary teen energy drinks',
    copy: 'Sugar, artificial dyes, and jittery amounts of caffeine built for teenagers and gamers.',
    icon: 'cup',
  },
  {
    title: 'Harsh gamer pre-workouts',
    copy: 'Overloaded stimulant blends that spike you hard and drop you into a crash.',
    icon: 'controller',
  },
  {
    title: 'Hydration-only mixes',
    copy: 'Electrolytes and nothing else: they hydrate you but give you no energy or function.',
    icon: 'drop',
  },
]
</script>

<template>
  <section id="why" class="container-pad py-20">
    <div class="mx-auto max-w-3xl text-center">
      <span class="eyebrow">Why 30Up is different</span>
      <h2
        class="mt-3 whitespace-nowrap font-extrabold tracking-tight text-white text-[clamp(1.5rem,5.6vw,2.75rem)]"
      >
        Most energy drinks never grew up.
      </h2>
      <p class="mt-6 text-lg text-slate-300">
        Most energy drinks are built for teenagers and gamers: sugar, artificial
        dyes, and jittery amounts of caffeine. 30Up is built for adults 30+ who
        need real energy for grown-up life (work, family, workouts, errands, long
        days) without the crash or the crash-out branding.
      </p>
    </div>

    <!-- What we're contrasting ourselves with -->
    <div class="mt-12 grid gap-5 sm:grid-cols-3">
      <article
        v-for="contrast in contrasts"
        :key="contrast.title"
        class="glass flex flex-col p-7 shadow-card"
      >
        <span
          class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-razz-500/20 to-lemon-400/20 text-razz-200"
          aria-hidden="true"
        >
          <!-- Soda cup -->
          <svg
            v-if="contrast.icon === 'cup'"
            class="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8" />
            <path d="M5 8h14" />
            <path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0" />
            <path d="m12 8 1-6h2" />
          </svg>
          <!-- Game controller -->
          <svg
            v-else-if="contrast.icon === 'controller'"
            class="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="6" x2="10" y1="12" y2="12" />
            <line x1="8" x2="8" y1="10" y2="14" />
            <line x1="15" x2="15.01" y1="13" y2="13" />
            <line x1="18" x2="18.01" y1="11" y2="11" />
            <path
              d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"
            />
          </svg>
          <!-- Water drop -->
          <svg
            v-else
            class="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
            />
          </svg>
        </span>
        <h3 class="text-lg font-bold text-white">{{ contrast.title }}</h3>
        <p class="mt-3 text-sm leading-relaxed text-slate-300">{{ contrast.copy }}</p>
      </article>
    </div>

    <p
      class="mx-auto mt-10 max-w-3xl text-balance text-center text-lg font-semibold text-white"
    >
      30Up is the only one combining
      <span class="bg-razz-lemon bg-clip-text text-transparent">
        smooth energy, hydration, and a <span class="whitespace-nowrap">healthy-aging</span> ingredient
      </span>
      in one.
    </p>

    <blockquote
      class="glass mx-auto mt-12 max-w-2xl px-8 py-10 text-center shadow-card"
    >
      <p class="text-2xl font-bold leading-snug text-white sm:text-3xl">
        <span class="bg-razz-lemon bg-clip-text text-transparent">
          "You're not 19 anymore. Your energy drink shouldn't be either."
        </span>
      </p>
    </blockquote>
  </section>
</template>
