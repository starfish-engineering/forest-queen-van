# Forest Queen 3D model — pipeline research (2026-07-19)

Deep-research pass (104 agents, 22 sources, 25 claims adversarially verified). Question:
best way to turn the van's photo archive into an ACCURATE, interactive 3D centerpiece for
this Next.js 16 / Vercel site, with hotspots deep-linking into the existing systems/journal/cost pages.

## Ground truth about our photos (verified locally, not from the web)
The 168 images in `public/images/` are grouped by **build topic** (floor-2 ×31, air-conditioner
×27, roof ×24, electrical ×21…) — interior/detail **documentation** shots, one good angle per
finished thing. There is **no exterior walk-around** and little multi-view overlap per zone.
→ This set is great for texture/reference and for the content pages, but it is **not a
reconstruction capture**. An accurate model needs a deliberate **re-capture**.

## Technique decision
- **3D Gaussian Splatting (3DGS)** = primary. Photoreal, captures chrome/glass/paint reflections
  that break mesh photogrammetry, renders real-time in-browser at 100+ FPS, medium file size.
- **Mesh photogrammetry** = only where you need metric accuracy, editable geometry, or rock-solid
  hotspot anchoring (splat geometry is implicit, ~7.8cm vs mesh ~1–3cm, not measurable/editable).
- **NeRF = no** (slow, not web-native).
- **Hybrid pattern (recommended):** splat is the visual hero; an **invisible lightweight mesh
  proxy** aligned to it anchors the hotspots (stable 3D coords + occlusion).
- Feed-forward "reconstruct from messy photos" methods exist (WildSplatter/AnySplat, 2026) but are
  **research-grade, unproven on hundreds of inconsistent photos** — a salvage attempt, not a plan.

## Re-capture protocol (the accuracy insurance)
- **Overlap:** 80%+ between consecutive shots; **90% for interior and for tall objects** (a van is
  both). Each surface should appear in ≥2–3 frames.
- **Lighting:** soft/diffuse — overcast sky or shade. **Avoid direct sun** (moving glare defeats
  feature tracking).
- **Exterior:** slow orbit at **3 heights** (low / eye / high), full 360°, plus the roof from above
  if reachable. ~150–250 phone photos.
- **Interior:** methodical sweep, one zone at a time, 90% overlap, corners and up/down.
- **Phone is fine.** ⚠️ Myths **refuted** by the research: the "300–500 images required", "fixed
  focal length / manual focus at infinity", and "photogrammetry beats splats for interaction" rules
  are all false — don't over-constrain the shoot.

## Tools (2026, costs verified)
Capture→model (splat), Mac/phone-friendly, **no NVIDIA GPU needed** (our devbox is 4-core/no-GPU —
do NOT train here):
- **Polycam Pro** ~$8/mo, cloud. **Luma AI** cloud. **Scaniverse** free (iOS). **KIRI** free tier.
- **Postshot** free/local but needs an NVIDIA GPU (we don't have one).
Mesh path (fallback): **Metashape** $179 perpetual, runs on Apple Silicon (cross-platform);
RealityScan/RealityCapture is free under $1M rev but **Windows + NVIDIA only** → not for us.

## Web delivery (Next.js / Vercel)
- **Spark** (World Labs, Three.js-native) — composites splats **and** meshes in one scene; best fit
  for splat-hero + mesh-hotspots + a separate interior scene. Formats .ply/.spz/.splat/.ksplat/.sog,
  LoD streaming. Alt: **@mkkellogg/GaussianSplats3D** `DropInViewer` (r3f-friendly, .ksplat/SPZ).
- **Budget ~1–2M splats** for 60fps on phones (mobile is the binding constraint). Compress to
  .ksplat/.spz/.sog.
- **Host the big asset on R2 / Vercel Blob, not in git / Vercel static** (reasoned inference — the
  research didn't pin Vercel's exact static limit). We already have R2 infra in the studio.
- Hotspots: drei `<Html position=[x,y,z]>` with `occlude` → markers are real DOM, so each is a Next
  `<Link>` into `/systems/electrical` etc. PlayCanvas/SuperSplat also does native splat annotations
  (≤25, with camera fly-to) if we prefer a hosted editor.

## Recommended pipeline
1. **Re-capture** the finished van (exterior orbit ×3 heights + interior sweep), ~30–45 min, overcast/shade.
2. **Process to a splat** via Polycam/Luma (cloud) → export .ply.
3. **Compress** to .ksplat/.spz, target 1–2M splats; **upload to R2**.
4. **Render** in the app with Spark in an r3f canvas: exterior splat hero → "step inside" swaps to
   interior splat/scene.
5. **Hotspots:** invisible mesh proxy + drei `<Html>` markers, fed from `data/systems.json`, linking
   to the existing pages. Reuse all current content + infra.
6. **Fallback** if the van's glossy exterior splats poorly: mesh photogrammetry (Metashape on Mac) →
   GLB → Draco/meshopt + KTX2 → standard r3f + drei. Less photoreal, sturdier hotspots + easier cutaway.

**Biggest risk to accuracy:** the reflective exterior (paint/chrome/glass) plus a rushed capture.
Splats tolerate reflections better than mesh, but mirrors/sharp specular still fight both — so the
controlled re-shoot is the highest-leverage step. **Peel/cutaway on a splat is unproven** (no native
splat clipping confirmed); simplest reliable reveal is swapping exterior→interior scenes, not peeling.

### Sources
3DGS paper (Kerbl 2023); utsubo, 4dpipeline, teleport/varjo (technique); Pix4D + 80.lv + Prusa
(capture); sparkjs.dev + mkkellogg/GaussianSplats3D + swyvl (delivery); drei docs + PlayCanvas
(hotspots); Metashape-LA + thefuture3d (tools); WildSplatter/Wild3R/AnySplat arXiv (feed-forward).
