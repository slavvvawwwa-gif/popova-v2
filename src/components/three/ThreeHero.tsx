import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

/* ── Issue #9: thick wireframe rectangle using Line2 (pixel-width lines) ── */
function WireRect({
  w, h, z, ox = 0, oy = 0,
  color = "#d4af37", opacity = 0.14, lineWidth = 1.6,
  rotSpeed = 0.12, floatAmp = 0.07, floatSpeed = 0.3, phase = 0,
}: {
  w: number; h: number; z: number;
  ox?: number; oy?: number;
  color?: string; opacity?: number; lineWidth?: number;
  rotSpeed?: number; floatAmp?: number; floatSpeed?: number; phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const { size } = useThree();

  const line = useMemo(() => {
    const pts = [
      -w/2, -h/2, 0,
       w/2, -h/2, 0,
       w/2,  h/2, 0,
      -w/2,  h/2, 0,
      -w/2, -h/2, 0, // close
    ];
    const geo = new LineGeometry();
    geo.setPositions(pts);
    const mat = new LineMaterial({
      color,
      linewidth: lineWidth,
      transparent: true,
      opacity,
      resolution: new THREE.Vector2(size.width, size.height),
    });
    return new Line2(geo, mat);
  }, [w, h, color, opacity, lineWidth, size.width, size.height]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(t * rotSpeed + phase) * 0.16;
    ref.current.rotation.x = Math.cos(t * rotSpeed * 0.7 + phase) * 0.045;
    ref.current.position.y = oy + Math.sin(t * floatSpeed + phase) * floatAmp;
  });

  return (
    <group ref={ref} position={[ox, oy, z]}>
      <primitive object={line} />
    </group>
  );
}

/* ── Diagonal slash line ── */
function SlashLine({ from, to, color = "#d4af37", opacity = 0.07, lineWidth = 1.2 }: {
  from: [number, number, number];
  to: [number, number, number];
  color?: string; opacity?: number; lineWidth?: number;
}) {
  const { size } = useThree();
  const line = useMemo(() => {
    const geo = new LineGeometry();
    geo.setPositions([...from, ...to]);
    const mat = new LineMaterial({
      color,
      linewidth: lineWidth,
      transparent: true,
      opacity,
      resolution: new THREE.Vector2(size.width, size.height),
    });
    return new Line2(geo, mat);
  }, [from, to, color, opacity, lineWidth, size.width, size.height]);

  return <primitive object={line} />;
}

/* ── Floating particles ── */
function Particles({ count = 70 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { geo, initY } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const initY: number[] = [];
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 14;
      pos[i*3+1] = (Math.random() - 0.5) * 10;
      pos[i*3+2] = (Math.random() - 0.5) * 6 - 3;
      initY.push(pos[i*3+1]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geo: g, initY };
  }, [count]);

  const mat = useMemo(() => new THREE.PointsMaterial({ color: "#d4af37", size: 0.02, transparent: true, opacity: 0.3, sizeAttenuation: true }), []);
  const pts = useMemo(() => new THREE.Points(geo, mat), [geo, mat]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.1;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i*3+1] = initY[i] + Math.sin(t + i * 0.38) * 0.1;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return <primitive ref={ref} object={pts} />;
}

/* ── Camera follows mouse with gentle lag ── */
function CameraRig({ mouseX, mouseY }: { mouseX: React.MutableRefObject<number>; mouseY: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (mouseX.current * 0.0025 - camera.position.x) * 0.025;
    camera.position.y += (-mouseY.current * 0.0018 - camera.position.y) * 0.025;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene({ mouseX, mouseY }: { mouseX: React.MutableRefObject<number>; mouseY: React.MutableRefObject<number> }) {
  return (
    <>
      <CameraRig mouseX={mouseX} mouseY={mouseY} />
      <Particles count={70} />

      {/* Outer proscenium — thicker */}
      <WireRect w={11} h={7.5} z={0}    lineWidth={1.8} opacity={0.10} rotSpeed={0.055} floatAmp={0.04} floatSpeed={0.22} phase={0} />
      {/* Inner stage frame */}
      <WireRect w={8.5} h={5.8} z={-1.5} ox={0.2} oy={0.1} color="#b87333" lineWidth={1.6} opacity={0.14} rotSpeed={0.08} floatAmp={0.07} floatSpeed={0.30} phase={1.2} />
      {/* Right flat */}
      <WireRect w={5} h={8} z={-3} ox={3.5} lineWidth={1.4} opacity={0.10} rotSpeed={0.11} floatAmp={0.11} floatSpeed={0.36} phase={2.1} />
      {/* Left flat */}
      <WireRect w={4} h={7} z={-2.5} ox={-3.8} oy={0.2} color="#b87333" lineWidth={1.4} opacity={0.09} rotSpeed={0.09} floatAmp={0.09} floatSpeed={0.40} phase={0.7} />
      {/* Deep background */}
      <WireRect w={14} h={9} z={-5} lineWidth={1.2} opacity={0.05} rotSpeed={0.035} floatAmp={0.025} floatSpeed={0.18} phase={3.0} />

      <SlashLine from={[-7, 4, -1]} to={[-3, -4, -1]} opacity={0.06} lineWidth={1.2} />
      <SlashLine from={[7, 4, -1]}  to={[3, -4, -1]}  opacity={0.06} lineWidth={1.2} />
      <SlashLine from={[-5, 3.5, -3]} to={[5, -3.5, -3]} color="#b87333" opacity={0.04} lineWidth={1.1} />
    </>
  );
}

export default function ThreeHero({ mouseX, mouseY }: {
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      dpr={[1, 1.5]}
    >
      <Scene mouseX={mouseX} mouseY={mouseY} />
    </Canvas>
  );
}
