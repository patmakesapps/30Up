<script setup lang="ts">
import { reactive, ref } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import BaseSelect from './BaseSelect.vue'
import waterPhoto from '../photos/30up_water_close_up.png'

interface WaitlistForm {
  email: string
  ageRange: string
  wouldBuy: string
  caffeineLevel: string
  energySource: string
  message: string
}

// Reusable option arrays for the select fields
const ageRanges = ['30–39', '40–49', '50–59', '60+', 'Under 30 but interested']
const buyOptions = [
  'Yes, 10-stick box',
  'Yes, 20-serving pouch',
  'Maybe',
  'Not yet',
]
const caffeineLevels = ['80–100 mg', '100–150 mg', '150–200 mg', 'Not sure']
const energySources = [
  'Coffee',
  'Energy drinks',
  'Pre-workout',
  'Soda',
  'Tea',
  'None',
  'Other',
]

const form = reactive<WaitlistForm>({
  email: '',
  ageRange: '',
  wouldBuy: '',
  caffeineLevel: '',
  energySource: '',
  message: '',
})

const errors = reactive<{ email?: string }>({})
const submitted = ref(false)
const submitting = ref(false)
const submitError = ref<string | null>(null)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(): boolean {
  errors.email = undefined

  if (!form.email.trim()) {
    errors.email = 'Email address is required.'
  } else if (!emailPattern.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }

  return !errors.email
}

async function handleSubmit() {
  if (!validate() || submitting.value) return

  submitting.value = true
  submitError.value = null

  // Snapshot of the submitted data, shaped for Firestore.
  const payload = {
    ...form,
    email: form.email.trim().toLowerCase(),
    createdAt: serverTimestamp(),
    source: 'waitlist-landing',
  }

  try {
    // Write the signup to the `waitlist` Firestore collection.
    // Access is controlled by firestore.rules (public create only).
    await addDoc(collection(db, 'waitlist'), payload)
    console.log('30Up waitlist submission saved.')
    submitted.value = true
  } catch (err) {
    console.error('Waitlist submission failed:', err)
    submitError.value =
      'Something went wrong saving your spot. Please try again in a moment.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section id="waitlist" class="relative overflow-hidden py-20">
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <img
        :src="waterPhoto"
        alt=""
        class="absolute -left-32 -top-24 h-[34rem] w-[34rem] rounded-full object-cover opacity-15 blur-2xl"
        loading="lazy"
      />
      <div class="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-razz-600/20 blur-[120px]"></div>
    </div>

    <div class="container-pad">
      <div class="mx-auto max-w-3xl text-center">
        <span class="eyebrow">First Batch</span>
        <h2 class="section-title mt-3">Help shape the first batch.</h2>
        <p class="mt-6 text-lg text-slate-300">
          We're validating 30Up before manufacturing. Join the first batch list,
          vote on product direction, and get early access when samples or
          preorders open.
        </p>
      </div>

      <!-- Success state -->
      <div
        v-if="submitted"
        class="glass mx-auto mt-12 max-w-2xl p-10 text-center shadow-card"
        role="status"
        aria-live="polite"
      >
        <div
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-razz-500/20 text-razz-400"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <p class="mt-5 text-xl font-bold text-white">
          You're on the list. We'll keep you posted as 30Up gets closer to the
          first batch.
        </p>
      </div>

      <!-- Form -->
      <form
        v-else
        class="glass mx-auto mt-12 max-w-2xl p-7 shadow-card sm:p-10"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <div class="grid gap-6">
          <!-- Email -->
          <div>
            <label for="email" class="mb-2 block text-sm font-semibold text-white">
              Email address <span class="text-razz-400">*</span>
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              name="email"
              autocomplete="email"
              required
              placeholder="you@example.com"
              class="w-full rounded-xl border border-white/15 bg-ink-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-razz-400"
              :class="{ 'border-red-400': errors.email }"
              :aria-invalid="!!errors.email"
              :aria-describedby="errors.email ? 'email-error' : undefined"
            />
            <p v-if="errors.email" id="email-error" class="mt-2 text-sm text-red-400">
              {{ errors.email }}
            </p>
          </div>

          <!-- Age range -->
          <div>
            <label for="ageRange" class="mb-2 block text-sm font-semibold text-white">
              Age range
            </label>
            <BaseSelect
              id="ageRange"
              v-model="form.ageRange"
              :options="ageRanges"
              placeholder="Select your age range"
            />
          </div>

          <!-- Would you buy -->
          <div>
            <label for="wouldBuy" class="mb-2 block text-sm font-semibold text-white">
              Would you buy 30Up Blue Razz Lemonade?
            </label>
            <BaseSelect
              id="wouldBuy"
              v-model="form.wouldBuy"
              :options="buyOptions"
              placeholder="Select an option"
            />
          </div>

          <!-- Caffeine level -->
          <div>
            <label for="caffeineLevel" class="mb-2 block text-sm font-semibold text-white">
              Preferred caffeine level
            </label>
            <BaseSelect
              id="caffeineLevel"
              v-model="form.caffeineLevel"
              :options="caffeineLevels"
              placeholder="Select a caffeine level"
            />
          </div>

          <!-- Current energy source -->
          <div>
            <label for="energySource" class="mb-2 block text-sm font-semibold text-white">
              Current energy source
            </label>
            <BaseSelect
              id="energySource"
              v-model="form.energySource"
              :options="energySources"
              placeholder="Select your current go-to"
            />
          </div>

          <!-- Optional message -->
          <div>
            <label for="message" class="mb-2 block text-sm font-semibold text-white">
              What would make you try 30Up?
              <span class="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="message"
              v-model="form.message"
              name="message"
              rows="4"
              placeholder="Tell us what matters to you…"
              class="w-full rounded-xl border border-white/15 bg-ink-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-razz-400"
            ></textarea>
          </div>

          <p
            v-if="submitError"
            class="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-center text-sm text-red-300"
            role="alert"
          >
            {{ submitError }}
          </p>

          <button type="submit" class="btn-primary w-full" :disabled="submitting">
            {{ submitting ? 'Joining…' : 'Join the First Batch' }}
          </button>

          <p class="text-center text-xs text-slate-500">
            No spam. We'll only email you about 30Up updates, samples, and the
            first batch.
          </p>
        </div>
      </form>
    </div>
  </section>
</template>
