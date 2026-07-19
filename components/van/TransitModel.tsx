'use client';

import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Procedural 2019 Ford Transit 250 — high roof, extended wheelbase (EL).
 * Real dimensions, in meters: length 6.70, width ~2.06, height 2.79,
 * wheelbase 3.75, front axle x=2.39, rear axle x=-1.36 (long EL rear overhang).
 * +X = front, +Y = up, +Z = passenger side. Origin: ground, mid-body.
 *
 * `open` fades the body shell to an x-ray so the documented build inside —
 * bed/garage, galley, battery bank, water, propane, framing — is the subject.
 */

const PAINT = '#e8eae6'; // Oxford-white
const DARK = '#1c201e';
const GLASS = '#0a1216';
const WOOD = '#c9a877';
const BIRCH = '#dbc9a4';
const STEEL = '#9aa0a3';

function useBodyProfile() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-3.35, 0.62); // rear, bottom of body
    s.lineTo(2.7, 0.62); // rocker line
    s.lineTo(3.28, 0.68); // bumper lower lip
    s.quadraticCurveTo(3.38, 0.8, 3.38, 0.98); // bumper face
    s.lineTo(3.32, 1.28); // grille top
    s.quadraticCurveTo(3.2, 1.4, 2.98, 1.44); // hood
    s.lineTo(2.6, 1.5); // cowl
    s.lineTo(2.0, 2.32); // windshield rake
    s.quadraticCurveTo(1.82, 2.56, 1.55, 2.66); // roof lead-in
    s.quadraticCurveTo(1.15, 2.8, 0.75, 2.8);
    s.lineTo(-3.22, 2.8); // high roof
    s.quadraticCurveTo(-3.36, 2.8, -3.36, 2.66);
    s.closePath(); // vertical rear face
    return s;
  }, []);
}

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.37, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.37, 0.37, 0.25, 28]} />
        <meshStandardMaterial color="#141615" roughness={0.9} />
      </mesh>
      <mesh position={[0, z > 0 ? 0.13 : -0.13, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.02, 20]} />
        <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function WheelArch({ x }: { x: number }) {
  return (
    <mesh position={[x, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.45, 0.45, 2.1, 24]} />
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

      {/* galley, driver side: cabinet, butcher-block, sink, faucet */}
      <mesh position={[0.65, 1.1, -0.68]} castShadow>
        <boxGeometry args={[1.7, 0.82, 0.55]} />
        <meshStandardMaterial color={BIRCH} roughness={0.65} />
      </mesh>
      <mesh position={[0.65, 1.55, -0.66]}>
        <boxGeometry args={[1.74, 0.06, 0.6]} />
        <meshStandardMaterial color="#a97b46" roughness={0.5} />
      </mesh>
      <mesh position={[1.0, 1.585, -0.66]}>
        <boxGeometry args={[0.42, 0.03, 0.34]} />
        <meshStandardMaterial color="#6f7d85" metalness={0.85} roughness={0.25} />
      </mesh>
      <group position={[1.0, 1.58, -0.86]}>
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.26, 10]} />
          <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.26, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.18, 10]} />
          <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* fridge + fresh-water tank under/next to galley */}
      <mesh position={[-0.4, 1.02, -0.68]} castShadow>
        <boxGeometry args={[0.55, 0.72, 0.55]} />
        <meshStandardMaterial color="#3a3f3d" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[1.42, 0.9, -0.62]}>
        <boxGeometry args={[0.42, 0.38, 0.3]} />
        <meshStandardMaterial color="#eef0ee" roughness={0.6} />
      </mesh>

      {/* upper cabinets, driver side */}
      <mesh position={[0.55, 2.32, -0.78]}>
        <boxGeometry args={[1.9, 0.42, 0.34]} />
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

      {/* 80/20 aluminum uprights */}
      {[
        [0.9, -0.9],
        [-0.9, -0.9],
        [0.4, 0.9],
        [-1.3, 0.9],
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
  const shellMat = useRef<THREE.MeshStandardMaterial>(null);
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
      {/* body shell */}
      <mesh geometry={bodyGeom} castShadow>
        <meshStandardMaterial
          ref={shellMat}
          color={PAINT}
          metalness={0.35}
          roughness={0.4}
          transparent
          envMapIntensity={0.9}
        />
      </mesh>

      {/* glass + exterior fittings that fade with the shell */}
      <group ref={glassGroup}>
        {/* windshield on the rake */}
        <Glass size={[1.02, 0.035, 1.66]} position={[2.33, 1.93, 0]} rotation={[0, 0, 0.93]} />
        {/* cab door windows */}
        <Glass size={[0.78, 0.6, 0.02]} position={[1.95, 1.95, 1.03]} />
        <Glass size={[0.78, 0.6, 0.02]} position={[1.95, 1.95, -1.03]} />
        {/* sliding-door window (passenger) + galley T-vent (driver) */}
        <Glass size={[1.0, 0.55, 0.02]} position={[0.45, 1.92, 1.03]} />
        <Glass size={[0.85, 0.5, 0.02]} position={[0.5, 1.9, -1.03]} />
        {/* rear door windows */}
        <Glass size={[0.02, 0.6, 0.72]} position={[-3.38, 2.1, 0.45]} />
        <Glass size={[0.02, 0.6, 0.72]} position={[-3.38, 2.1, -0.45]} />

        {/* grille + headlights + bumper */}
        <mesh position={[3.37, 1.13, 0]}>
          <boxGeometry args={[0.06, 0.3, 1.3]} />
          <meshStandardMaterial color={DARK} roughness={0.6} />
        </mesh>
        {[0.09, 0, -0.09].map((dy) => (
          <mesh key={dy} position={[3.4, 1.13 + dy, 0]}>
            <boxGeometry args={[0.02, 0.035, 1.26]} />
            <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {[0.64, -0.64].map((z) => (
          <mesh key={z} position={[3.33, 1.33, z]}>
            <boxGeometry args={[0.08, 0.15, 0.44]} />
            <meshStandardMaterial color="#e9edf0" emissive="#c8d4dc" emissiveIntensity={0.35} roughness={0.15} />
          </mesh>
        ))}
        <mesh position={[3.34, 0.74, 0]}>
          <boxGeometry args={[0.12, 0.28, 2.02]} />
          <meshStandardMaterial color="#2a2d2c" roughness={0.8} />
        </mesh>

        {/* taillights */}
        {[0.88, -0.88].map((z) => (
          <mesh key={z} position={[-3.38, 1.2, z]}>
            <boxGeometry args={[0.02, 0.55, 0.14]} />
            <meshStandardMaterial color="#8c1f1f" emissive="#5a1010" emissiveIntensity={0.4} roughness={0.3} />
          </mesh>
        ))}

        {/* mirrors */}
        {[1.0, -1.0].map((side) => (
          <group key={side}>
            <mesh position={[2.55, 1.92, side * 1.1]}>
              <boxGeometry args={[0.05, 0.05, 0.24]} />
              <meshStandardMaterial color={DARK} roughness={0.7} />
            </mesh>
            <mesh position={[2.55, 1.86, side * 1.24]}>
              <boxGeometry args={[0.1, 0.28, 0.16]} />
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

      {/* wheels + arches (always visible) */}
      <WheelArch x={2.39} />
      <WheelArch x={-1.36} />
      <Wheel x={2.39} z={0.88} />
      <Wheel x={2.39} z={-0.88} />
      <Wheel x={-1.36} z={0.88} />
      <Wheel x={-1.36} z={-0.88} />

      {/* roof kit: rails, 400W solar, MaxxAir fan */}
      {[0.62, -0.62].map((z) => (
        <mesh key={z} position={[-0.9, 2.84, z]}>
          <boxGeometry args={[4.4, 0.05, 0.06]} />
          <meshStandardMaterial color="#2f3331" roughness={0.6} />
        </mesh>
      ))}
      <SolarPanel x={-0.35} />
      <SolarPanel x={-2.05} />
      <group position={[1.0, 2.86, 0]}>
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
