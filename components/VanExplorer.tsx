'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Splat, Html, useProgress } from '@react-three/drei';
import { Component, Suspense, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';

// drei's canonical sample splat — stands in until a real Forest Queen scan is set
// via NEXT_PUBLIC_SPLAT_URL (a Scaniverse/Luma .splat export hosted on R2).
const SAMPLE_SPLAT = 'https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat';

export type HotspotSystem = {
  slug: string;
  name: string;
  icon: string;
  totalCost: number;
  headline: string;
  pos: [number, number, number]; // placeholder coords — retune against the real splat
};

// If the splat URL fails to load, keep the scene alive with a wireframe proxy
// rather than crashing the whole canvas.
class SplatBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
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

export default function VanExplorer({
  systems,
  splatUrl,
}: {
  systems: HotspotSystem[];
  splatUrl: string;
}) {
  const usingSample = !splatUrl;
  const url = splatUrl || SAMPLE_SPLAT;
  const [active, setActive] = useState<HotspotSystem | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  return (
    <div className="fqx-root">
      <Canvas camera={{ position: [4, 2, 6], fov: 45 }} dpr={[1, 1.5]}>
        <color attach="background" args={['#0e1511']} />
        <Suspense fallback={<Loader />}>
          <group>
            <SplatBoundary
              fallback={
                <mesh>
                  <boxGeometry args={[2, 1, 4]} />
                  <meshBasicMaterial color="#33604a" wireframe />
                </mesh>
              }
            >
              <Splat src={url} />
            </SplatBoundary>
            {systems.map((s) => (
              <Html
                key={s.slug}
                position={s.pos}
                center
                distanceFactor={10}
                occlude
                zIndexRange={[10, 0]}
              >
                <button
                  className={`fqx-hs${active?.slug === s.slug ? ' on' : ''}`}
                  onClick={() => setActive(active?.slug === s.slug ? null : s)}
                  aria-label={s.name}
                >
                  <span aria-hidden>{s.icon}</span>
                </button>
              </Html>
            ))}
          </group>
        </Suspense>
        <OrbitControls
          enableDamping
          autoRotate={!active && !reduced}
          autoRotateSpeed={0.4}
          minDistance={2}
          maxDistance={14}
        />
      </Canvas>

      {/* ---- overlay chrome ---- */}
      <header className="fqx-top">
        <div>
          <p className="fqx-eyebrow">2019 Ford Transit 250 · explore the build</p>
          <h1 className="fqx-title">Forest Queen</h1>
        </div>
        <div className="fqx-price">
          <b>$75,000</b>
          <span>For sale</span>
        </div>
      </header>

      {usingSample && (
        <div className="fqx-banner" role="status">
          <b>Placeholder scan.</b> A sample model stands in for the van to prove the interaction —
          the hotspots below are wired to the real build. Drop the Scaniverse export at{' '}
          <code>NEXT_PUBLIC_SPLAT_URL</code> to swap in the Forest Queen.
        </div>
      )}

      {/* system chip rail — usable regardless of 3D hotspot coordinates */}
      <nav className="fqx-rail" aria-label="Systems">
        {systems.map((s) => (
          <button
            key={s.slug}
            className={`fqx-chip${active?.slug === s.slug ? ' on' : ''}`}
            onClick={() => setActive(active?.slug === s.slug ? null : s)}
          >
            <span aria-hidden>{s.icon}</span>
            {s.name.replace(/ System| Power/, '')}
          </button>
        ))}
      </nav>

      <p className="fqx-hint">Drag to orbit · tap a system to open it</p>

      {active && (
        <aside className="fqx-panel">
          <button className="fqx-close" onClick={() => setActive(null)} aria-label="Close">
            ✕
          </button>
          <p className="fqx-kicker">
            {active.icon} {active.name}
          </p>
          <p className="fqx-headline">{active.headline}</p>
          <p className="fqx-cost">
            System cost <b>${active.totalCost.toLocaleString()}</b>
          </p>
          <Link className="fqx-link" href={`/systems/${active.slug}`}>
            See the full {active.name.toLowerCase()} →
          </Link>
        </aside>
      )}

      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
.fqx-root{position:fixed;inset:0;background:#0e1511;color:#f3f0e6;
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden;touch-action:none}
.fqx-loader{display:flex;align-items:center;gap:8px;color:#c9d4c9;font-size:13px;white-space:nowrap}
.fqx-spin{width:14px;height:14px;border-radius:50%;border:2px solid #2a352c;border-top-color:#cf9646;
  animation:fqxspin .7s linear infinite}
@keyframes fqxspin{to{transform:rotate(360deg)}}
.fqx-hs{width:34px;height:34px;border-radius:50%;border:1px solid #cf9646;
  background:rgba(20,29,23,.85);color:#fff;font-size:16px;line-height:1;cursor:pointer;
  display:grid;place-items:center;backdrop-filter:blur(4px);transition:transform .15s,box-shadow .15s}
.fqx-hs:hover,.fqx-hs.on{transform:scale(1.15);box-shadow:0 0 0 4px rgba(207,150,70,.3),0 0 20px rgba(207,150,70,.5)}
.fqx-top{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;
  align-items:flex-start;padding:clamp(16px,3vw,32px);pointer-events:none}
.fqx-eyebrow{margin:0 0 4px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#9db0a1}
.fqx-title{margin:0;font-family:"Iowan Old Style",Palatino,Georgia,serif;font-weight:600;
  font-size:clamp(26px,5vw,46px);line-height:1;letter-spacing:-.01em}
.fqx-price{text-align:right;background:rgba(21,29,23,.7);border:1px solid #2a352c;border-radius:12px;
  padding:9px 14px;backdrop-filter:blur(8px)}
.fqx-price b{display:block;font-family:ui-monospace,Menlo,monospace;font-size:17px}
.fqx-price span{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#cf9646}
.fqx-banner{position:absolute;top:clamp(70px,14vh,110px);left:50%;transform:translateX(-50%);
  max-width:min(560px,90vw);background:rgba(21,29,23,.9);border:1px solid #cf964655;border-radius:12px;
  padding:11px 15px;font-size:13px;color:#c9d4c9;line-height:1.45;backdrop-filter:blur(8px)}
.fqx-banner code{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#cf9646}
.fqx-rail{position:absolute;left:50%;bottom:48px;transform:translateX(-50%);display:flex;gap:8px;
  flex-wrap:wrap;justify-content:center;max-width:94vw;padding:8px;border-radius:14px;
  background:rgba(21,29,23,.7);border:1px solid #2a352c;backdrop-filter:blur(10px)}
.fqx-chip{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#f3f0e6;
  background:#1b241d;border:1px solid #2a352c;border-radius:10px;padding:8px 11px;cursor:pointer;transition:.15s}
.fqx-chip:hover{border-color:#cf9646}
.fqx-chip.on{background:#cf9646;color:#1a1206;border-color:#cf9646}
.fqx-hint{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);margin:0;
  font-size:11px;color:#9db0a1}
.fqx-panel{position:absolute;top:0;right:0;height:100%;width:min(340px,86vw);
  background:rgba(15,21,17,.94);border-left:1px solid #2a352c;backdrop-filter:blur(14px);
  padding:56px 24px 24px;display:flex;flex-direction:column;gap:14px}
.fqx-close{position:absolute;top:16px;right:16px;width:30px;height:30px;border-radius:8px;
  border:1px solid #2a352c;background:#1b241d;color:#f3f0e6;cursor:pointer;font-size:15px}
.fqx-kicker{margin:0;font-family:"Iowan Old Style",Palatino,Georgia,serif;font-size:22px}
.fqx-headline{margin:0;color:#9db0a1;font-size:14px;line-height:1.5}
.fqx-cost{margin:0;font-family:ui-monospace,Menlo,monospace;font-size:13px;color:#c9d4c9;
  border:1px dashed #2a352c;border-radius:9px;padding:8px 12px;width:fit-content}
.fqx-cost b{color:#cf9646}
.fqx-link{margin-top:auto;color:#cf9646;text-decoration:none;font-weight:600;font-size:14px}
.fqx-link:hover{text-decoration:underline}
@media (prefers-reduced-motion:reduce){.fqx-hs,.fqx-chip{transition:none}.fqx-spin{animation:none}}
`;
