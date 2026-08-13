"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  Environment,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

/**
 * Single floating/rotating geometric shape.
 * Each shape gets its own drift speed, rotation axis, and float amplitude
 * so the field never looks mechanically uniform.
 */
function Shape({
  position,
  geometry,
  color,
  scale = 1,
  speed = 1,
  distort = 0.3,
  glass = false,
}: {
  position: [number, number, number];
  geometry: "icosahedron" | "torus" | "octahedron" | "box";
  color: string;
  scale?: number;
  speed?: number;
  distort?: number;
  glass?: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const rotAxis = useMemo(
    () => new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
    []
  );

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotateOnAxis(rotAxis, delta * 0.15 * speed);
  });

  const geo = useMemo(() => {
    switch (geometry) {
      case "icosahedron":
        return <icosahedronGeometry args={[1, 0]} />;
      case "torus":
        return <torusGeometry args={[0.7, 0.28, 32, 100]} />;
      case "octahedron":
        return <octahedronGeometry args={[1, 0]} />;
      case "box":
        return <boxGeometry args={[1.2, 1.2, 1.2]} />;
    }
  }, [geometry]);

  return (
    <Float
      speed={1.2 * speed}
      rotationIntensity={0.6}
      floatIntensity={1.4}
      position={position}
    >
      <mesh ref={mesh} scale={scale} castShadow receiveShadow>
        {geo}
        {glass ? (
          <MeshTransmissionMaterial
            color={color}
            thickness={0.6}
            roughness={0.08}
            transmission={1}
            ior={1.3}
            chromaticAberration={0.03}
          />
        ) : (
          <MeshDistortMaterial
            color={color}
            distort={distort}
            speed={1.4}
            roughness={0.15}
            metalness={0.4}
            emissive={color}
            emissiveIntensity={0.15}
          />
        )}
      </mesh>
    </Float>
  );
}

/** Rotates the whole rig toward the pointer for a subtle parallax-tilt effect. */
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame((state) => {
    if (!group.current) return;
    const targetX = (state.pointer.y * viewport.height) / 90;
    const targetY = (state.pointer.x * viewport.width) / 90;
    // Lerp for smooth, inertial parallax rather than a hard snap.
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      targetX,
      0.04
    );
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      targetY,
      0.04
    );
  });

  return <group ref={group}>{children}</group>;
}

const PALETTE = ["#6366f1", "#22d3ee", "#a855f7", "#38bdf8", "#f472b6"];

function Scene() {
  const shapes = useMemo(
    () => [
      { pos: [-3.2, 1.2, -1], geo: "icosahedron", scale: 1.1, speed: 0.9 },
      { pos: [3, -0.6, -2], geo: "torus", scale: 1.3, speed: 1.2 },
      { pos: [-1.6, -1.6, 0.5], geo: "octahedron", scale: 0.9, speed: 1.4, glass: true },
      { pos: [2.4, 1.8, 0], geo: "box", scale: 0.8, speed: 0.7 },
      { pos: [0.2, 0.2, -3], geo: "icosahedron", scale: 1.6, speed: 0.5, glass: true },
      { pos: [-3.6, -0.4, -2.5], geo: "octahedron", scale: 0.7, speed: 1.1 },
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[6, 6, 6]} intensity={40} color="#818cf8" />
      <pointLight position={[-6, -4, -2]} intensity={25} color="#22d3ee" />

      <ParallaxRig>
        {shapes.map((s, i) => (
          <Shape
            key={i}
            position={s.pos as [number, number, number]}
            geometry={s.geo as "icosahedron" | "torus" | "octahedron" | "box"}
            color={PALETTE[i % PALETTE.length]}
            scale={s.scale}
            speed={s.speed}
            glass={s.glass}
          />
        ))}
      </ParallaxRig>

      <ContactShadows
        position={[0, -3, 0]}
        opacity={0.3}
        scale={20}
        blur={2.5}
        far={4}
      />
      <Environment preset="city" />
    </>
  );
}

/**
 * Full-bleed 3D hero background. Pointer-events are disabled on the canvas
 * wrapper so it never blocks clicks on foreground UI — it purely reacts to
 * `state.pointer` from R3F's internal raycaster tracking.
 */
export default function HeroCanvas() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      {/* Vignette so 3D shapes recede behind foreground text/UI */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/40 to-slate-950" />
    </div>
  );
}
