# 30Up — Energy for Grown-Up Life

A modern, responsive launch/waitlist landing page for **30Up**, a powdered energy
drink mix concept for adults 30+. First flavor: **Blue Razz Lemonade**.

Built with **Vue 3 + Vite + TypeScript + Tailwind CSS**.

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (default http://localhost:5173).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production (output in `dist/`)
- `npm run preview` — preview the production build locally

## Project structure

```
index.html              # SEO + Open Graph meta, app mount point
src/
  main.ts               # App bootstrap
  App.vue               # Composes all page sections
  style.css             # Tailwind layers + design tokens/components
  components/
    SiteHeader.vue      # Sticky nav + mobile menu
    HeroSection.vue     # Hero copy + CSS product mockup
    ProductMockup.vue   # Pure-CSS pouch/stick-pack mockup (no image asset)
    ProblemSection.vue
    ProductSection.vue
    AudienceSection.vue
    FormulaSection.vue
    WaitlistSection.vue # First-batch form → Firestore
    FounderSection.vue
    FaqSection.vue      # Accessible accordion
    SiteFooter.vue
  views/
    HomeView.vue        # Landing page (all sections)
    AuthView.vue        # Login / signup
    AccountView.vue     # Protected dashboard + order-history placeholder
  composables/
    useAuth.ts          # App-wide Firebase Auth state
  router/
    index.ts            # Routes + auth guard
  firebase.ts           # Firebase init (Firestore + Auth)
firestore.rules         # Waitlist security rules
.env.example            # Firebase config template
```

## Firebase setup

This project uses **Firebase** (Firestore for the waitlist, Auth for accounts).

1. **Register a Web app** in the Firebase Console
   (Project settings → General → *Your apps* → `</>`). Copy the config values.
2. **Create `.env`** from `.env.example` and paste in `VITE_FIREBASE_API_KEY`
   and `VITE_FIREBASE_APP_ID` (the rest are pre-filled for project `up-3fcd5`).
   `.env` is git-ignored. Firebase web config values are **not secrets** —
   access is controlled by Firestore Security Rules.
3. **Enable Firestore** (Build → Firestore Database → Create database).
4. **Publish the rules** in `firestore.rules` (Firestore → Rules → paste → Publish).
5. **Enable Email/Password auth** (Build → Authentication → Sign-in method).

### Waitlist form

`src/components/WaitlistSection.vue` writes submissions to the `waitlist`
Firestore collection (`addDoc`) with client-side validation, loading, and error
states. View signups in the Firebase Console.

### Accounts & dashboard

- `/login` — sign up / log in (Firebase Auth, email + password)
- `/account` — protected dashboard (profile, first-batch status, and an
  **order/transaction history placeholder** ready to be wired to a future
  `orders` collection — see the `TODO` in `src/views/AccountView.vue`)

Auth state lives in `src/composables/useAuth.ts`; route protection is in
`src/router/index.ts`.

## Notes

30Up is in development. Product names, formulas, packaging, claims, caffeine
levels, ingredients, and availability are subject to change. This site is for
early interest and product validation only.
