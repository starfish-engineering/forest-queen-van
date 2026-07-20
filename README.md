# forest-queen-van

forestqueenvan.com — build journal and sale listing for the Forest Queen, a 2019
Ford Transit 250 (high roof, extended) converted by hand into a full-time home.

- Next.js (App Router) + Tailwind, deployed on Vercel (git auto-deploy; previews per branch)
- Journal/system/cost content lives in `data/*.json`; photos in `public/images/`
- `/explore` — interactive 3D model of the van (`components/van/TransitModel.tsx`);
  capture plan for the future photo-real splat: `docs/3d-model/`

## Dev

```bash
npm install
npm run dev   # port 4300
```

Verify with `npx tsc --noEmit` (no local `next build` on the devbox).
