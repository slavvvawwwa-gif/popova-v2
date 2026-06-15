import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ── Wireframe rectangular frame ── */
function WireRect({
  w, h, z, ox = 0, oy = 0,
  color = "#d4af37", opacity = 0.12,
  rotSpeed = 0.15, floatAmp = 0.08, floatSpeed = 0.4, phase = 0,
}: {
  w: number; h: number; z: number;
  ox?: number; oy?: number;
  color?: string; opacity?: number;
  rotSpeed?: number; floatAmp?: number; floatSpeed?: number; phase?: number;
}) {
  const ref = useRef<THREE.LineLoop>(null);

  const object = useMemo(() => {
    const pts = [
      new THREE.Vector3(-w/2, -h/2, 0),
      new THREE.Vector3( w/2, -h/2, 0),
      new THREE.Vector3( w/2,  h/2, 0),
      new THREE.Vector3(-w/2,  h/2, 0),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    return new THREE.LineLoop(geo, mat);
  }, [w, h, color, opacity]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(t * rotSpeed + phase) * 0.18;
    ref.current.rotation.x = Math.cos(t * rotSpeed * 0.7 + phase) * 0.05;
    ref.current.position.y = oy + Math.sin(t * floatSpeed + phase) * floatAmp;
  });

  return <primitive ref={ref} object={object} position={[ox, oy, z]} />;
}

/* ── Diagonal accent lines ── */
function SlashLine({ from, to, color = "#d4af37", opacity = 0.08 }: {
  from: [number,number,number]; to: [number,number,number];
  color?: string; opacity?: number;
}) {
  const object = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...from),
      new THREE.Vector3(...to),
    ]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    return new THREE.Line(geo, mat);
  }, [from, to, color, opacity]);

  return <primitive object={object} />;
}

/* ── Floating particles ── */
function Particles({ count = 100 }: { count?: number }) {
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
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geo, initY };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.12;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i*3+1] = initY[i] + Math.sin(t + i * 0.4) * 0.12;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = Math.sin(t * 0.3) * 0.04;
  });

  const mat = useMemo(() => new THREE.PointsMaterial({ color:"#d4af37", size:0.018, transparent:true, opacity:0.35, sizeAttenuation:true }), []);

  return <primitive ref={ref} object={new THREE.Points(geo, mat)} />;
}

/* ── Camera follows mouse ── */
function CameraRig({ mouseX, mouseY }: { mouseX: React.MutableRefObject<number>; mouseY: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (mouseX.current * 0.003 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY.current * 0.002 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ── Full scene ── */
function Scene({ mouseX, mouseY }: { mouseX: React.MutableRefObject<number>; mouseY: React.MutableRefObject<number> }) {
  return (
    <>
      <CameraRig mouseX={mouseX} mouseY={mouseY} />
      <Particles count={100} />

      {/* Outer proscenium frame */}
      <WireRect w={11} h={7.5} z={0}   opacity={0.07} rotSpeed={0.06} floatAmp={0.04} floatSpeed={0.25} phase={0}/>
      {/* Inner frame */}
      <WireRect w={8.5} h={5.8} z={-1.5} ox={0.2} oy={0.1} color="#b87333" opacity={0.10} rotSpeed={0.09} floatAmp={0.07} floatSpeed={0.32} phase={1.2}/>
      {/* Right stage flat */}
      <WireRect w={5} h={8} z={-3} ox={3.5} opacity={0.08} rotSpeed={0.12} floatAmp={0.12} floatSpeed={0.38} phase={2.1}/>
      {/* Left stage flat */}
      <WireRect w={4} h={7} z={-2.5} ox={-3.8} oy={0.2} color="#b87333" opacity={0.07} rotSpeed={0.10} floatAmp={0.09} floatSpeed={0.42} phase={0.7}/>
      {/* Deep background frame */}
      <WireRect w={14} h={9} z={-5} opacity={0.04} rotSpeed={0.04} floatAmp={0.03} floatSpeed={0.20} phase={3.0}/>

      {/* Diagonal accent lines */}
      <SlashLine from={[-7, 4, -1]} to={[-3, -4, -1]} opacity={0.06}/>
      <SlashLine from={[7, 4, -1]}  to={[3, -4, -1]}  opacity={0.06}/>
      <SlashLine from={[-5, 3.5, -3]} to={[5, -3.5, -3]} color="#b87333" opacity={0.04}/>
    </>
  );
}

export default function ThreeHero({ mouseX, mouseY }: {
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
}) {
  return (
    <Canvas
      camera={{ position:[0, 0, 6], fov:55 }}
      gl={{ antialias:true, alpha:true }}
      style={{ position:"absolute", inset:0, pointerEvents:"none" }}
      dpr={[1, 1.5]}
    >
      <Scene mouseX={mouseX} mouseY={mouseY} />
    </Canvas>
  );
}
