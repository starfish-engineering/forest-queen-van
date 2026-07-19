# Capturing the Forest Queen for the 3D scan

Goal: one clean iPhone capture that reconstructs into a Gaussian splat for `/explore`.
Tool: **Scaniverse** (free, iOS) → Splat mode. (Luma or Polycam Pro also work if you prefer cloud.)
Full rationale in [RESEARCH.md](./RESEARCH.md).

## Conditions
- **Overcast day or open shade.** Never direct sun — moving glare/shadows break the reconstruction.
- Van **clean and static**, doors closed for the exterior pass. Move nothing between passes.
- Keep moving slowly and steadily; let the phone auto-expose. Don't lock focus.

## Exterior pass (~150–250 frames, 3 heights)
Walk a full 360° circle around the van **three times**, each frame ~80% overlapping the last:
1. **Low** — camera ~knee height, angled slightly up.
2. **Eye** — straight on.
3. **High** — arms raised / above the roofline, angled down.
Then grab the **front, rear, and roof** directly (roof from a step stool if safe).
Every part of the body should appear in **at least 3 frames**.

## Interior pass (~90% overlap, one zone at a time)
Slower and denser than the exterior. Sweep each zone, catching corners and up/down:
cab → galley/sink → electrical bay (battery + Victron) → bed/garage → bath.
Interiors need **90% overlap** — overlap more than feels necessary.

## After capture
1. Process in Scaniverse (**Splat** output), export as `.ply` / `.splat`.
2. Compress toward **1–2M splats** (mobile 60fps budget) — `.ksplat`/`.spz`.
3. Upload to **R2** (studio bucket), grab the public URL.
4. Set **`NEXT_PUBLIC_SPLAT_URL`** in the Vercel `forest-queen-van` project (Preview + Production).
5. Ping me — I re-tune the six hotspot coordinates in `app/explore/page.tsx` to sit on the real van.

**Biggest failure mode:** rushing it. Overlap and soft light are what make it accurate — a careful
20–30 min beats a fast 5 min every time.
