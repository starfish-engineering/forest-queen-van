'use client';

import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Procedural 2019 Ford Transit 250 — high roof, extended wheelbase (EL).
 * Real dimensions, in meters: length 6.70, width ~2.06, height 2.79,
 * wheelbase 3.75, front axle x=2.39, rear axle x=-1.36 (long EL rear overhang).
 * +X = front, +Y = up, +Z = passenger side. Origin: ground, mid-body.
 * Exterior proportions matched against a CC Wikimedia reference of the same
 * body (T-350HD high-roof EL): short steep hood, raked grille face, big
 * windshield, roof dome rising from the header, amber clearance markers.
 *
 * Interior mirrors the documented build (per the photo archive):
 * galley on the PASSENGER side aft of the slider (window above, MaxxAir fan
 * overhead), toilet/cooler-fridge bench on the DRIVER side under its window,
 * bed/garage rear with the battery bank + Victron, propane in the rear corner.
 *
 * `open` fades the body shell to an x-ray so the build inside is the subject.
 */

const PAINT = '#eef1ed'; // Oxford-white
const DARK = '#1c201e';
const GLASS = '#0a1216';
const WOOD = '#c9a877';
const BIRCH = '#dbc9a4';
const STEEL = '#9aa0a3';

function useBodyProfile() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-3.35, 0.62); // rear, bottom of body
    // rocker line, notched with real wheel-arch openings (axle y=0.37, r=0.5)
    s.lineTo(-1.793, 0.62);
    s.absarc(-1.36, 0.37, 0.5, 2.618, 0.524, true); // rear arch
    s.lineTo(1.957, 0.62);
    s.absarc(2.39, 0.37, 0.5, 2.618, 0.524, true); // front arch
    s.lineTo(2.75, 0.62);
    s.lineTo(3.3, 0.7); // bumper lower lip
    s.quadraticCurveTo(3.42, 0.82, 3.42, 1.0); // bumper face
    s.lineTo(3.36, 1.22); // bumper top
    s.lineTo(3.24, 1.54); // grille face, raked back
    s.quadraticCurveTo(3.05, 1.6, 2.62, 1.68); // short steep hood to cowl
    s.lineTo(2.08, 2.28); // big windshield rake
    s.quadraticCurveTo(1.55, 2.68, 0.7, 2.8); // roof dome over the cab
    s.lineTo(-3.18, 2.8); // high roof
    s.quadraticCurveTo(-3.36, 2.8, -3.36, 2.62);
    s.closePath(); // vertical rear face
    return s;
  }, []);
}

function Wheel({ x, z }: { x: number; z: number }) {
  const out = z > 0 ? 1 : -1; // local +Y maps to world +Z after the PI/2 tilt
  return (
    <group position={[x, 0.37, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.37, 0.37, 0.24, 32]} />
        <meshStandardMaterial color="#1a1c1b" roughness={0.95} />
      </mesh>
      <mesh position={[0, out * 0.125, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.035, 24]} />
        <meshStandardMaterial color="#b9bec0" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, out * 0.148, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.02, 16]} />
        <meshStandardMaterial color="#3a3f41" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

// Dark liner inside the arch tunnel — blocks the see-through into the interior.
function ArchLiner({ x }: { x: number }) {
  return (
    <mesh position={[x, 0.37, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.435, 0.435, 1.88, 24]} />
      <meshStandardMaterial color="#0d0f0e" roughness={1} />
    </mesh>
  );
}

function Glass({
  size,
  position,
  rotation,
}: {
  size: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={GLASS} metalness={0.9} roughness={0.08} envMapIntensity={1.6} />
    </mesh>
  );
}

function Battery({ x }: { x: number }) {
  return (
    <group position={[x, 0.84, -0.68]}>
      <mesh castShadow>
        <boxGeometry args={[0.26, 0.24, 0.18]} />
        <meshStandardMaterial color="#f2f2f0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[0.26, 0.06, 0.18]} />
        <meshStandardMaterial color="#1d5fb8" roughness={0.5} />
      </mesh>
    </group>
  );
}

function SolarPanel({ x }: { x: number }) {
  return (
    <group position={[x, 2.88, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.05, 0.95]} />
        <meshStandardMaterial color="#0d1b33" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[1.44, 0.005, 0.89]} />
        <meshStandardMaterial color="#16294a" metalness={0.7} roughness={0.15} />
      </mesh>
    </group>
  );
}

function Interior() {
  return (
    <group>
      {/* cargo floor */}
      <mesh position={[-0.5, 0.68, 0]}>
        <boxGeometry args={[5.6, 0.05, 1.82]} />
        <meshStandardMaterial color="#b08a5a" roughness={0.75} />
      </mesh>

      {/* cab: dash, seats, wheel */}
      <mesh position={[2.78, 1.3, 0]}>
        <boxGeometry args={[0.45, 0.45, 1.8]} />
        <meshStandardMaterial color={DARK} roughness={0.8} />
      </mesh>
      {[-0.55, 0.55].map((z) => (
        <group key={z}>
          <mesh position={[2.15, 1.05, z]} castShadow>
            <boxGeometry args={[0.55, 0.45, 0.55]} />
            <meshStandardMaterial color="#2b2f2d" roughness={0.9} />
          </mesh>
          <mesh position={[1.92, 1.55, z]} rotation={[0, 0, -0.15]}>
            <boxGeometry args={[0.14, 0.75, 0.55]} />
            <meshStandardMaterial color="#2b2f2d" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <mesh position={[2.48, 1.5, -0.55]} rotation={[0, 0, 1.1]}>
        <torusGeometry args={[0.18, 0.025, 10, 24]} />
        <meshStandardMaterial color="#111312" roughness={0.7} />
      </mesh>

      {/* bed platform + mattress + garage face (rear) */}
      <mesh position={[-2.35, 1.28, 0]} castShadow>
        <boxGeometry args={[1.9, 0.08, 1.78]} />
        <meshStandardMaterial color={WOOD} roughness={0.7} />
      </mesh>
      <mesh position={[-2.35, 1.43, 0]} castShadow>
        <boxGeometry args={[1.82, 0.2, 1.68]} />
        <meshStandardMaterial color="#d8d4cc" roughness={0.95} />
      </mesh>
      <mesh position={[-1.42, 0.98, 0]}>
        <boxGeometry args={[0.05, 0.55, 1.78]} />
        <meshStandardMaterial color={WOOD} roughness={0.7} />
      </mesh>

      {/* battery bank (4× Battle Born) in the garage, driver side */}
      {[-1.75, -2.05, -2.35, -2.65].map((x) => (
        <Battery key={x} x={x} />
      ))}
      {/* Victron inverter on the driver wall above the bank */}
      <mesh position={[-1.7, 1.85, -0.86]}>
        <boxGeometry args={[0.32, 0.44, 0.09]} />
        <meshStandardMaterial color="#1852a4" roughness={0.4} />
      </mesh>

      {/* galley — PASSENGER side, aft of the slider doorway (open the slider,
          the kitchen is right there; its window sits above the counter) */}
      <mesh position={[-0.8, 1.1, 0.68]} castShadow>
        <boxGeometry args={[1.2, 0.82, 0.55]} />
        <meshStandardMaterial color={BIRCH} roughness={0.65} />
      </mesh>
      <mesh position={[-0.8, 1.55, 0.66]}>
        <boxGeometry args={[1.26, 0.06, 0.6]} />
        <meshStandardMaterial color="#a97b46" roughness={0.5} />
      </mesh>
      {/* stove at the doorway end of the counter */}
      <mesh position={[-0.38, 1.585, 0.66]}>
        <boxGeometry args={[0.42, 0.035, 0.36]} />
        <meshStandardMaterial color="#8b9298" metalness={0.8} roughness={0.3} />
      </mesh>
      {[-0.48, -0.28].map((x) => (
        <mesh key={x} position={[x, 1.605, 0.66]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.01, 16]} />
          <meshStandardMaterial color="#26292b" roughness={0.6} />
        </mesh>
      ))}
      {/* sink + faucet */}
      <mesh position={[-1.05, 1.585, 0.66]}>
        <boxGeometry args={[0.36, 0.03, 0.3]} />
        <meshStandardMaterial color="#6f7d85" metalness={0.85} roughness={0.25} />
      </mesh>
      <group position={[-1.05, 1.58, 0.86]}>
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.26, 10]} />
          <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.26, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.18, 10]} />
          <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      {/* fresh-water tank under the galley */}
      <mesh position={[-1.15, 0.9, 0.6]}>
        <boxGeometry args={[0.42, 0.38, 0.3]} />
        <meshStandardMaterial color="#eef0ee" roughness={0.6} />
      </mesh>

      {/* toilet/cooler-fridge bench — DRIVER side, under its window */}
      <mesh position={[0.7, 0.91, -0.7]} castShadow>
        <boxGeometry args={[1.2, 0.42, 0.5]} />
        <meshStandardMaterial color={BIRCH} roughness={0.65} />
      </mesh>
      <mesh position={[0.7, 1.16, -0.7]}>
        <boxGeometry args={[1.16, 0.08, 0.46]} />
        <meshStandardMaterial color="#3a4038" roughness={0.9} />
      </mesh>
      {/* cooler-fridge face in the bench front */}
      <mesh position={[0.45, 0.9, -0.44]}>
        <boxGeometry args={[0.5, 0.34, 0.03]} />
        <meshStandardMaterial color="#4a5054" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* upper cabinets: long run above the driver bench, short one by the bed */}
      <mesh position={[0.7, 2.32, -0.78]}>
        <boxGeometry args={[1.6, 0.42, 0.34]} />
        <meshStandardMaterial color={BIRCH} roughness={0.65} />
      </mesh>
      <mesh position={[-1.6, 2.32, 0.78]}>
        <boxGeometry args={[0.7, 0.42, 0.34]} />
        <meshStandardMaterial color={BIRCH} roughness={0.65} />
      </mesh>

      {/* propane locker, rear passenger corner */}
      <mesh position={[-2.9, 0.88, 0.58]}>
        <boxGeometry args={[0.45, 0.36, 0.42]} />
        <meshStandardMaterial color="#7d8481" roughness={0.6} />
      </mesh>

      {/* ceiling slats */}
      {Array.from({ length: 9 }, (_, i) => -2.9 + i * 0.52).map((x) => (
        <mesh key={x} position={[x, 2.62, 0]}>
          <boxGeometry args={[0.1, 0.02, 1.8]} />
          <meshStandardMaterial color="#d9c9a8" roughness={0.8} />
        </mesh>
      ))}

      {/* 80/20 aluminum uprights at the galley + bench ends */}
      {[
        [-0.25, 0.9],
        [-1.35, 0.9],
        [0.15, -0.9],
        [1.25, -0.9],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 1.65, z]}>
          <boxGeometry args={[0.045, 1.9, 0.045]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

export default function TransitModel({ open }: { open: boolean }) {
  const profile = useBodyProfile();
  const shellMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const glassGroup = useRef<THREE.Group>(null);

  const bodyGeom = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(profile, {
      depth: 1.9,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 3,
      curveSegments: 24,
    });
    g.translate(0, 0, -0.95);
    return g;
  }, [profile]);

  useFrame((_, dt) => {
    const k = Math.min(1, dt * 5);
    if (shellMat.current) {
      const target = open ? 0.1 : 1;
      shellMat.current.opacity += (target - shellMat.current.opacity) * k;
      shellMat.current.depthWrite = shellMat.current.opacity > 0.6;
    }
    if (glassGroup.current) {
      glassGroup.current.visible = !open;
    }
  });

  return (
    <group>
      {/* body shell — clearcoat car paint */}
      <mesh geometry={bodyGeom} castShadow>
        <meshPhysicalMaterial
          ref={shellMat}
          color={PAINT}
          metalness={0.15}
          roughness={0.38}
          clearcoat={0.55}
          clearcoatRoughness={0.18}
          transparent
          envMapIntensity={1.1}
        />
      </mesh>

      {/* glass + exterior fittings that fade with the shell */}
      <group ref={glassGroup}>
        {/* windshield laid flat on the rake face (cowl 2.62,1.68 → header 2.08,2.28,
            pushed out along the face normal to clear the bevel-expanded skin) */}
        <Glass size={[0.8, 0.035, 1.7]} position={[2.38, 2.01, 0]} rotation={[0, 0, -0.84]} />
        {/* cab door windows — deep Transit glass, kept behind the A-pillar rake */}
        <Glass size={[0.66, 0.56, 0.02]} position={[1.7, 1.9, 1.03]} />
        <Glass size={[0.66, 0.56, 0.02]} position={[1.7, 1.9, -1.03]} />
        {/* sliding-door window + galley window aft of it (passenger) */}
        <Glass size={[1.0, 0.6, 0.02]} position={[0.45, 1.9, 1.03]} />
        <Glass size={[1.1, 0.5, 0.02]} position={[-0.8, 1.88, 1.03]} />
        {/* driver-side window above the bench */}
        <Glass size={[0.9, 0.5, 0.02]} position={[0.6, 1.88, -1.03]} />
        {/* rear door windows */}
        <Glass size={[0.02, 0.6, 0.72]} position={[-3.44, 2.1, 0.45]} />
        <Glass size={[0.02, 0.6, 0.72]} position={[-3.44, 2.1, -0.45]} />

        {/* grille assembly on the raked nose face: mesh, three bars, Ford oval */}
        <group position={[3.33, 1.38, 0]} rotation={[0, 0, 0.36]}>
          <mesh>
            <boxGeometry args={[0.05, 0.3, 1.24]} />
            <meshStandardMaterial color={DARK} roughness={0.6} />
          </mesh>
          {[0.09, 0, -0.09].map((dy) => (
            <mesh key={dy} position={[0.03, dy, 0]}>
              <boxGeometry args={[0.02, 0.035, 1.2]} />
              <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          <mesh position={[0.045, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.085, 0.085, 0.02, 24]} />
            <meshStandardMaterial color="#1d4f9e" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* headlights on the same raked plane, flanking the grille top */}
          {[0.79, -0.79].map((lz) => (
            <mesh key={lz} position={[0.02, 0.07, lz]}>
              <boxGeometry args={[0.05, 0.15, 0.32]} />
              <meshStandardMaterial color="#e9edf0" emissive="#c8d4dc" emissiveIntensity={0.35} roughness={0.15} />
            </mesh>
          ))}
        </group>

        {/* black front bumper mass + air dam + fog lights */}
        <mesh position={[3.44, 0.88, 0]}>
          <boxGeometry args={[0.16, 0.52, 2.04]} />
          <meshStandardMaterial color="#26292b" roughness={0.85} />
        </mesh>
        <mesh position={[3.32, 0.5, 0]}>
          <boxGeometry args={[0.12, 0.18, 1.3]} />
          <meshStandardMaterial color="#1f2224" roughness={0.9} />
        </mesh>
        {[0.78, -0.78].map((z) => (
          <mesh key={z} position={[3.47, 0.74, z]}>
            <boxGeometry args={[0.06, 0.08, 0.18]} />
            <meshStandardMaterial color="#d7dde0" emissive="#aebfc8" emissiveIntensity={0.2} roughness={0.2} />
          </mesh>
        ))}

        {/* amber clearance markers on the high-roof front */}
        {[-0.3, 0, 0.3].map((z) => (
          <mesh key={z} position={[1.1, 2.79, z]}>
            <boxGeometry args={[0.09, 0.035, 0.06]} />
            <meshStandardMaterial color="#e8930c" emissive="#c9720a" emissiveIntensity={0.6} roughness={0.3} />
          </mesh>
        ))}

        {/* taillights + black rear step bumper */}
        {[0.88, -0.88].map((z) => (
          <mesh key={z} position={[-3.44, 1.2, z]}>
            <boxGeometry args={[0.02, 0.55, 0.14]} />
            <meshStandardMaterial color="#8c1f1f" emissive="#5a1010" emissiveIntensity={0.4} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[-3.44, 0.52, 0]}>
          <boxGeometry args={[0.16, 0.14, 2.06]} />
          <meshStandardMaterial color="#26292b" roughness={0.85} />
        </mesh>

        {/* mirrors */}
        {[1.0, -1.0].map((side) => (
          <group key={side}>
            <mesh position={[2.45, 1.98, side * 1.1]}>
              <boxGeometry args={[0.05, 0.05, 0.26]} />
              <meshStandardMaterial color={DARK} roughness={0.7} />
            </mesh>
            <mesh position={[2.45, 1.9, side * 1.25]}>
              <boxGeometry args={[0.11, 0.3, 0.17]} />
              <meshStandardMaterial color={DARK} roughness={0.7} />
            </mesh>
          </group>
        ))}

        {/* sliding-door + rear-door seams */}
        {[-0.15, 1.45].map((x) => (
          <mesh key={x} position={[x, 1.6, 1.02]}>
            <boxGeometry args={[0.015, 1.85, 0.012]} />
            <meshStandardMaterial color="#c4c6c2" roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[-3.375, 1.7, 0]}>
          <boxGeometry args={[0.012, 2.1, 0.015]} />
          <meshStandardMaterial color="#c4c6c2" roughness={0.6} />
        </mesh>
      </group>

      {/* wheels in real arch cutouts, slightly recessed from the skin */}
      <ArchLiner x={2.39} />
      <ArchLiner x={-1.36} />
      <Wheel x={2.39} z={0.82} />
      <Wheel x={2.39} z={-0.82} />
      <Wheel x={-1.36} z={0.82} />
      <Wheel x={-1.36} z={-0.82} />

      {/* roof kit: rails, 400W solar, MaxxAir fan above the galley */}
      {[0.62, -0.62].map((z) => (
        <mesh key={z} position={[-1.25, 2.84, z]}>
          <boxGeometry args={[3.8, 0.05, 0.06]} />
          <meshStandardMaterial color="#2f3331" roughness={0.6} />
        </mesh>
      ))}
      <SolarPanel x={-0.1} />
      <SolarPanel x={-2.4} />
      <group position={[-1.25, 2.86, 0]}>
        <mesh>
          <boxGeometry args={[0.5, 0.07, 0.5]} />
          <meshStandardMaterial color="#e8e8e4" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[0.44, 0.06, 0.44]} />
          <meshStandardMaterial color="#d2d4d0" roughness={0.35} />
        </mesh>
      </group>

      <Interior />
    </group>
  );
}
