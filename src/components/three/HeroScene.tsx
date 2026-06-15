import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function Particles({ count = 600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random()-0.5) * 20;
      pos[i*3+1] = (Math.random()-0.5) * 20;
      pos[i*3+2] = (Math.random()-0.5) * 10;
      sz[i] = Math.random() * 2 + 0.5;
    }
    return [pos, sz];
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial color="#d6303c" size={0.04} sizeAttenuation transparent opacity={0.5} />
    </points>
  );
}

function Ring() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      ref.current.rotation.z = state.clock.elapsedTime * 0.08;
    }
  });
  return (
    <Float speed={0.8} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref} position={[2, 0.5, -2]}>
        <torusGeometry args={[2.5, 0.015, 8, 120]} />
        <meshBasicMaterial color="#d6303c" transparent opacity={0.25} />
      </mesh>
      <mesh position={[-1, -0.5, -3]}>
        <torusGeometry args={[1.5, 0.01, 8, 80]} />
        <meshBasicMaterial color="#f0f0f0" transparent opacity={0.08} />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 1.5]} style={{ position:"absolute", inset:0 }}>
      <ambientLight intensity={0.5} />
      <Particles />
      <Ring />
    </Canvas>
  );
}
