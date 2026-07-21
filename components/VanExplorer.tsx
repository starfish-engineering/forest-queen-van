'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useProgress, Environment, ContactShadows, Lightformer } from '@react-three/drei';
import Image from 'next/image';
import { Component, Suspense, useState, useSyncExternalStore, type ReactNode } from 'react';
import Link from 'next/link';
import TransitModel from '@/components/van/TransitModel';
import type { ExplorerData, ExplorerSystem } from '@/lib/explorer';

type Active =
  | { kind: 'system'; s: ExplorerSystem }
  | { kind: 'costs' }
  | { kind: 'journal' }
  | { kind: 'sale' }
  | null;

// Keeps the canvas alive if a child throws — the scene still renders
// without the environment lighting.
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const REDUCED_MQ = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED_MQ);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
function getReducedMotion() {
  return window.matchMedia(REDUCED_MQ).matches;
}

function Loader() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <Html center>
      <div className="fqx-loader">
        <span className="fqx-spin" />
        {Math.round(progress)}%
      </div>
    </Html>
  );
}

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

export default function VanExplorer({ data, standalone }: { data: ExplorerData; standalone?: boolean }) {
  const { systems, buildTotal, categories, journal } = data;
  const [active, setActive] = useState<Active>(null);
  const [open, setOpen] = useState(false);
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  const activeSystem = active?.kind === 'system' ? active.s : null;

  const selectSystem = (s: ExplorerSystem) => {
    const next = activeSystem?.slug === s.slug ? null : ({ kind: 'system', s } as const);
    setActive(next);
    if (next && !s.roof && !open) setOpen(true);
  };
  const toggle = (kind: 'costs' | 'journal' | 'sale') =>
    setActive((a) => (a?.kind === kind ? null : { kind }));

  const maxCat = Math.max(...categories.map((c) => c.total));

  return (
    <div className={`fqx-root${standalone ? ' fqx-full' : ''}${active ? ' fqx-haspanel' : ''}`}>
      <Canvas shadows camera={{ position: [7.5, 3.0, 7.5], fov: 40 }} dpr={[1, 1.5]}>
        <color attach="background" args={['#0e1511']} />
        <fog attach="fog" args={['#0e1511', 16, 30]} />
        <hemisphereLight args={['#dfe8e2', '#20281f', 0.75]} />
        <directionalLight
          position={[6, 8, 4]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-7, 3, -6]} intensity={0.35} color="#a9c4d8" />
        {/* procedural studio env — no network fetch, deterministic reflections */}
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Environment resolution={64}>
              <Lightformer intensity={1.8} position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 6, 1]} />
              <Lightformer intensity={0.8} position={[-6, 2, 3]} rotation={[0, Math.PI / 2, 0]} scale={[6, 2.5, 1]} />
              <Lightformer intensity={0.6} position={[7, 2, -3]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 2.5, 1]} />
            </Environment>
          </Suspense>
        </ErrorBoundary>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <circleGeometry args={[16, 48]} />
          <meshStandardMaterial color="#131a15" roughness={1} />
        </mesh>
        <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={18} blur={2.4} far={4} />
        <Suspense fallback={<Loader />}>
          <TransitModel open={open} />
        </Suspense>
        {systems
          .filter((s) => open || s.roof)
          .map((s) => (
            <Html key={s.slug} position={s.pos} center distanceFactor={9} zIndexRange={[10, 0]}>
              <button
                className={`fqx-hs${activeSystem?.slug === s.slug ? ' on' : ''}`}
                onClick={() => selectSystem(s)}
                aria-label={s.name}
              >
                <span aria-hidden>{s.icon}</span>
              </button>
            </Html>
          ))}
        <OrbitControls
          makeDefault
          enableDamping
          target={[0, 1.4, 0]}
          autoRotate={!active && !reduced}
          autoRotateSpeed={0.4}
          minDistance={4}
          maxDistance={16}
          maxPolarAngle={Math.PI / 2 - 0.03}
        />
      </Canvas>

      {/* ---- overlay chrome ---- */}
      <header className="fqx-top">
        <div>
          <p className="fqx-eyebrow">2019 Ford Transit 250 · high roof · extended</p>
          <h1 className="fqx-title">Forest Queen</h1>
        </div>
        <button className={`fqx-price${active?.kind === 'sale' ? ' on' : ''}`} onClick={() => toggle('sale')}>
          <b>$75,000</b>
          <span>For sale</span>
        </button>
      </header>

      {/* system chip rail — usable regardless of 3D hotspot coordinates */}
      <nav className="fqx-rail" aria-label="Explore">
        <button className={`fqx-chip fqx-open${open ? ' on' : ''}`} onClick={() => setOpen((v) => !v)}>
          {open ? 'Close it up' : 'See inside'}
        </button>
        {systems.map((s) => (
          <button
            key={s.slug}
            className={`fqx-chip${activeSystem?.slug === s.slug ? ' on' : ''}`}
            onClick={() => selectSystem(s)}
          >
            <span aria-hidden>{s.icon}</span>
            {s.name.replace(/ System| Power/, '')}
          </button>
        ))}
        <span className="fqx-sep" aria-hidden />
        <button className={`fqx-chip${active?.kind === 'journal' ? ' on' : ''}`} onClick={() => toggle('journal')}>
          Journal
        </button>
        <button className={`fqx-chip${active?.kind === 'costs' ? ' on' : ''}`} onClick={() => toggle('costs')}>
          Costs
        </button>
      </nav>

      <p className="fqx-hint">Drag to orbit · open the build to look inside</p>

      {active && (
        <aside className="fqx-panel">
          <button className="fqx-close" onClick={() => setActive(null)} aria-label="Close">
            ✕
          </button>

          {activeSystem && (
            <>
              <p className="fqx-kicker">
                {activeSystem.icon} {activeSystem.name}
              </p>
              {activeSystem.image && (
                <Image
                  className="fqx-img"
                  src={activeSystem.image}
                  alt={activeSystem.name}
                  width={640}
                  height={480}
                />
              )}
              <p className="fqx-headline">{activeSystem.headline}</p>
              <div className="fqx-specs">
                {activeSystem.specs.map(([k, v]) => (
                  <div key={k} className="fqx-spec">
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
              <p className="fqx-cost">
                System cost <b>${activeSystem.totalCost.toLocaleString()}</b>
              </p>
              {activeSystem.posts.length > 0 && (
                <div className="fqx-list">
                  {activeSystem.posts.map((p) => (
                    <Link key={p.slug} className="fqx-row" href={`/journal/${p.slug}`}>
                      <span>{p.title}</span>
                      <span aria-hidden>→</span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {active.kind === 'costs' && (
            <>
              <p className="fqx-kicker">Build cost</p>
              <p className="fqx-kpi">${buildTotal.toLocaleString()}</p>
              <div className="fqx-bars">
                {categories.map((c) => (
                  <div key={c.name} className="fqx-barrow">
                    <span>{c.name}</span>
                    <span className="fqx-track">
                      <span className="fqx-fill" style={{ width: `${(c.total / maxCat) * 100}%` }} />
                    </span>
                    <b>${c.total.toLocaleString()}</b>
                  </div>
                ))}
              </div>
              <p className="fqx-note">Materials only — van, tools and labor not included.</p>
              <Link className="fqx-link" href="/costs">
                Every receipt, itemized →
              </Link>
            </>
          )}

          {active.kind === 'journal' && (
            <>
              <p className="fqx-kicker">Build journal</p>
              <p className="fqx-headline">{journal.length} chapters, empty van to home.</p>
              <div className="fqx-list">
                {journal.map((p) => (
                  <Link key={p.slug} className="fqx-row" href={`/journal/${p.slug}`}>
                    <span>{p.title}</span>
                    <span className="fqx-dim">{shortDate(p.date)}</span>
                  </Link>
                ))}
              </div>
            </>
          )}

          {active.kind === 'sale' && (
            <>
              <p className="fqx-kicker">For sale</p>
              <p className="fqx-kpi">$75,000</p>
              <div className="fqx-specs">
                <div className="fqx-spec">
                  <span>Platform</span>
                  <b>2019 Transit 250 EL, high roof</b>
                </div>
                <div className="fqx-spec">
                  <span>Power</span>
                  <b>400Ah lithium · 400W solar</b>
                </div>
                <div className="fqx-spec">
                  <span>Build invested</span>
                  <b>${buildTotal.toLocaleString()} in materials</b>
                </div>
                <div className="fqx-spec">
                  <span>Documentation</span>
                  <b>{journal.length} journal chapters</b>
                </div>
              </div>
              <Link className="fqx-cta" href="/contact">
                Get in touch
              </Link>
              <Link className="fqx-link" href="/for-sale">
                Full listing →
              </Link>
            </>
          )}
        </aside>
      )}

      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
.fqx-root{position:fixed;top:64px;left:0;right:0;bottom:0;background:#0e1511;color:#f3f0e6;
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden;touch-action:none}
.fqx-root.fqx-full{top:0}
.fqx-loader{display:flex;align-items:center;gap:8px;color:#c9d4c9;font-size:13px;white-space:nowrap}
.fqx-spin{width:14px;height:14px;border-radius:50%;border:2px solid #2a352c;border-top-color:#cf9646;
  animation:fqxspin .7s linear infinite}
@keyframes fqxspin{to{transform:rotate(360deg)}}
.fqx-hs{width:34px;height:34px;border-radius:50%;border:1px solid #cf9646;
  background:rgba(20,29,23,.85);color:#fff;font-size:16px;line-height:1;cursor:pointer;
  display:grid;place-items:center;backdrop-filter:blur(4px);transition:transform .15s,box-shadow .15s}
.fqx-hs:hover,.fqx-hs.on{transform:scale(1.15);box-shadow:0 0 0 4px rgba(207,150,70,.3),0 0 20px rgba(207,150,70,.5)}
.fqx-top{position:absolute;top:0;left:0;right:0;z-index:30;display:flex;justify-content:space-between;
  align-items:flex-start;padding:clamp(16px,3vw,32px);pointer-events:none}
.fqx-eyebrow{margin:0 0 4px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#9db0a1}
.fqx-title{margin:0;font-family:"Iowan Old Style",Palatino,Georgia,serif;font-weight:600;
  font-size:clamp(26px,5vw,46px);line-height:1;letter-spacing:-.01em}
.fqx-price{pointer-events:auto;text-align:right;background:rgba(21,29,23,.7);border:1px solid #2a352c;
  border-radius:12px;padding:9px 14px;backdrop-filter:blur(8px);color:inherit;cursor:pointer;transition:.15s}
.fqx-price:hover,.fqx-price.on{border-color:#cf9646}
.fqx-price b{display:block;font-family:ui-monospace,Menlo,monospace;font-size:17px}
.fqx-price span{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#cf9646}
.fqx-rail{position:absolute;left:50%;bottom:48px;transform:translateX(-50%);display:flex;gap:8px;
  flex-wrap:wrap;justify-content:center;align-items:stretch;max-width:94vw;padding:8px;border-radius:14px;
  background:rgba(21,29,23,.7);border:1px solid #2a352c;backdrop-filter:blur(10px)}
.fqx-sep{width:1px;background:#2a352c;margin:4px 2px}
.fqx-chip{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#f3f0e6;
  background:#1b241d;border:1px solid #2a352c;border-radius:10px;padding:8px 11px;cursor:pointer;transition:.15s}
.fqx-chip:hover{border-color:#cf9646}
.fqx-chip.on{background:#cf9646;color:#1a1206;border-color:#cf9646}
.fqx-open{border-color:#cf964688}
.fqx-hint{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);margin:0;
  font-size:11px;color:#9db0a1}
.fqx-panel{position:absolute;top:0;right:0;height:100%;width:min(360px,88vw);z-index:20;
  background:rgba(15,21,17,.94);border-left:1px solid #2a352c;backdrop-filter:blur(14px);
  padding:96px 24px 24px;display:flex;flex-direction:column;gap:14px;overflow-y:auto}
.fqx-close{position:absolute;top:16px;left:16px;width:30px;height:30px;border-radius:8px;
  border:1px solid #2a352c;background:#1b241d;color:#f3f0e6;cursor:pointer;font-size:15px}
.fqx-kicker{margin:0;font-family:"Iowan Old Style",Palatino,Georgia,serif;font-size:22px}
.fqx-img{width:100%;height:auto;border-radius:10px;border:1px solid #2a352c;aspect-ratio:4/3;object-fit:cover}
.fqx-headline{margin:0;color:#9db0a1;font-size:14px;line-height:1.5}
.fqx-kpi{margin:0;font-family:ui-monospace,Menlo,monospace;font-size:34px;color:#cf9646}
.fqx-specs{display:flex;flex-direction:column}
.fqx-spec{display:flex;justify-content:space-between;gap:12px;font-size:12px;padding:7px 0;
  border-bottom:1px dashed #222c24}
.fqx-spec span{color:#9db0a1}
.fqx-spec b{text-align:right;color:#f3f0e6}
.fqx-cost{margin:0;font-family:ui-monospace,Menlo,monospace;font-size:13px;color:#c9d4c9;
  border:1px dashed #2a352c;border-radius:9px;padding:8px 12px;width:fit-content}
.fqx-cost b{color:#cf9646}
.fqx-list{display:flex;flex-direction:column;gap:8px}
.fqx-row{display:flex;justify-content:space-between;gap:10px;padding:9px 12px;border:1px solid #2a352c;
  border-radius:9px;color:#f3f0e6;text-decoration:none;font-size:13px;transition:.15s}
.fqx-row:hover{border-color:#cf9646}
.fqx-dim{color:#9db0a1;font-size:12px;white-space:nowrap}
.fqx-bars{display:flex;flex-direction:column;gap:9px}
.fqx-barrow{display:grid;grid-template-columns:82px 1fr auto;align-items:center;gap:10px;font-size:12px}
.fqx-barrow span:first-child{color:#9db0a1}
.fqx-barrow b{font-family:ui-monospace,Menlo,monospace;font-weight:500}
.fqx-track{height:6px;border-radius:3px;background:#1b241d;overflow:hidden}
.fqx-fill{display:block;height:100%;border-radius:3px;background:#cf9646}
.fqx-note{margin:0;font-size:11px;color:#9db0a1}
.fqx-cta{background:#cf9646;color:#1a1206;text-align:center;font-weight:700;font-size:14px;
  border-radius:10px;padding:12px;text-decoration:none;transition:.15s}
.fqx-cta:hover{filter:brightness(1.08)}
.fqx-link{margin-top:auto;color:#cf9646;text-decoration:none;font-weight:600;font-size:14px}
.fqx-link:hover{text-decoration:underline}
@media (max-width:560px){.fqx-haspanel .fqx-top>div{opacity:0;pointer-events:none}}
@media (prefers-reduced-motion:reduce){.fqx-hs,.fqx-chip,.fqx-price{transition:none}.fqx-spin{animation:none}}
`;
