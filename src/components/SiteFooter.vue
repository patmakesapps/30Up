<script setup lang="ts">
import logo from '../photos/logo-full.webp'

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
          <img :src="logo" alt="30Up logo" class="w-44" />
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

      <div class="mt-10 rounded-2xl border border-lemon-400/20 bg-lemon-400/5 p-5">
        <h2 class="flex items-center gap-2 text-sm font-bold text-lemon-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Disclaimer
        </h2>
        <p class="mt-3 text-xs leading-relaxed text-slate-400">
          30Up is in development. Product names, formulas, packaging, claims,
          caffeine levels, ingredients, and availability are subject to change.
          This site is for early interest and product validation only.
        </p>
      </div>

      <p class="mt-6 text-xs text-slate-600">
        © {{ new Date().getFullYear() }} 30Up. All rights reserved.
      </p>
    </div>
  </footer>
</template>
