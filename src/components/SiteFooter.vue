<script setup lang="ts">
const socials = [
  { label: 'Instagram', href: '#' },
  { label: 'TikTok', href: '#' },
  { label: 'Email', href: 'mailto:hello@30up.example' },
]
</script>

<template>
  <footer class="border-t border-white/10 bg-ink-900">
    <div class="container-pad py-14">
      <div class="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <p class="text-2xl font-black tracking-tight">
            <span class="text-white">30</span><span class="text-razz-400">Up</span>
          </p>
          <p class="mt-2 text-slate-400">Energy for grown-up life.</p>
        </div>

        <nav aria-label="Social links">
          <ul class="flex flex-wrap gap-3">
            <li v-for="social in socials" :key="social.label">
              <a
                :href="social.href"
                class="inline-flex rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                {{ social.label }}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <p
        class="mt-10 border-t border-white/10 pt-8 text-xs leading-relaxed text-slate-500"
      >
        30Up is in development. Product names, formulas, packaging, claims,
        caffeine levels, ingredients, and availability are subject to change.
        This site is for early interest and product validation only.
      </p>

      <p class="mt-4 text-xs text-slate-600">
        © {{ new Date().getFullYear() }} 30Up. All rights reserved.
      </p>
    </div>
  </footer>
</template>
