<script setup lang="ts">
/**
 * Pure-CSS stylized product mockup (stick-pack / powder pouch look).
 * No image asset required.
 */
</script>

<template>
  <div class="relative mx-auto w-full max-w-sm">
    <!-- Ambient glow -->
    <div
      class="absolute -inset-6 -z-10 rounded-[2.5rem] bg-razz-lemon opacity-20 blur-3xl"
      aria-hidden="true"
    ></div>

    <!-- Pouch -->
    <div
      class="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-b from-ink-700 to-ink-900 p-1.5 shadow-card"
      role="img"
      aria-label="30Up Blue Razz Lemonade powder pouch mockup"
    >
      <!-- Top seam / hang tab -->
      <div class="mx-auto mb-1 h-3 w-24 rounded-b-xl bg-white/10"></div>

      <div
        class="relative rounded-[1.6rem] bg-gradient-to-br from-razz-600 via-razz-500 to-lemon-400 p-7 text-center"
      >
        <!-- subtle gloss -->
        <div
          class="pointer-events-none absolute inset-0 rounded-[1.6rem] bg-gradient-to-tr from-white/0 via-white/10 to-white/0"
          aria-hidden="true"
        ></div>

        <p class="text-5xl font-black tracking-tight text-ink-900 drop-shadow-sm">
          30Up
        </p>

        <div class="my-4 h-px w-full bg-ink-900/20"></div>

        <p class="text-lg font-extrabold uppercase tracking-wide text-ink-900">
          Blue Razz Lemonade
        </p>
        <p class="mt-1 text-sm font-medium text-ink-900/80">
          Energy for grown-up life.
        </p>

        <div
          class="mt-6 rounded-2xl bg-ink-900/85 px-4 py-4 text-left backdrop-blur-sm"
        >
          <p class="text-xs font-semibold uppercase tracking-wider text-razz-400">
            Caffeine + Electrolytes + B Vitamins
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              Zero Sugar
            </span>
            <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              No Artificial Dyes
            </span>
          </div>
        </div>

        <p class="mt-5 text-[0.65rem] font-medium uppercase tracking-[0.25em] text-ink-900/70">
          Powdered Energy Mix · Just Add Water
        </p>
      </div>
    </div>

    <!-- Floating stick pack accent -->
    <div
      class="absolute -bottom-6 -right-4 hidden w-20 rotate-12 rounded-xl border border-white/15 bg-gradient-to-b from-razz-500 to-lemon-400 p-2 text-center shadow-card sm:block"
      aria-hidden="true"
    >
      <p class="text-[0.6rem] font-black leading-tight text-ink-900">30Up</p>
      <p class="text-[0.5rem] font-bold leading-tight text-ink-900/80">STICK PACK</p>
    </div>
  </div>
</template>
