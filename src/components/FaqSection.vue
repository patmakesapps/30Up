<script setup lang="ts">
import { ref } from 'vue'

interface FaqItem {
  q: string
  a: string
}

const faqs: FaqItem[] = [
  {
    q: 'Is 30Up available now?',
    a: 'Not yet. 30Up is currently in development. We’re using the first batch list to validate interest, flavor direction, and product format before manufacturing.',
  },
  {
    q: 'What does 30Up mean?',
    a: '30Up means adults 30 and up. It is energy for grown-up life — work, family, workouts, errands, and long days.',
  },
  {
    q: 'Will 30Up have caffeine?',
    a: 'The planned product direction includes caffeine, but the final caffeine amount has not been finalized. Any finished product will clearly label caffeine content.',
  },
  {
    q: 'Is the formula final?',
    a: 'No. Formula, ingredients, caffeine level, packaging, flavor, and claims may change before launch.',
  },
  {
    q: 'Is 30Up a supplement?',
    a: 'The final product format and labeling will depend on the formula and manufacturing path. We’ll follow applicable labeling, manufacturing, and safety requirements before launch.',
  },
  {
    q: 'Will there be other flavors?',
    a: 'Blue Razz Lemonade is the first planned flavor. Additional flavors may come later based on feedback.',
  },
  {
    q: 'Can I get samples?',
    a: 'Join the first batch list to be notified about sample opportunities, preorders, and launch updates.',
  },
]

// Track which item is open (single-open accordion). null = all closed.
const openIndex = ref<number | null>(0)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <section id="faq" class="container-pad py-20">
    <div class="mx-auto max-w-3xl text-center">
      <span class="eyebrow">Questions</span>
      <h2 class="section-title mt-3">Frequently asked questions</h2>
    </div>

    <div class="mx-auto mt-12 max-w-3xl space-y-3">
      <div
        v-for="(faq, index) in faqs"
        :key="faq.q"
        class="glass overflow-hidden"
      >
        <h3>
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            :aria-expanded="openIndex === index"
            :aria-controls="`faq-panel-${index}`"
            :id="`faq-button-${index}`"
            @click="toggle(index)"
          >
            <span class="text-base font-semibold text-white sm:text-lg">{{ faq.q }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 shrink-0 text-razz-400 transition-transform duration-200"
              :class="{ 'rotate-180': openIndex === index }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </h3>
        <div
          v-show="openIndex === index"
          :id="`faq-panel-${index}`"
          role="region"
          :aria-labelledby="`faq-button-${index}`"
          class="px-6 pb-5 text-slate-300"
        >
          {{ faq.a }}
        </div>
      </div>
    </div>
  </section>
</template>
