import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Build a single theatrical mask as contour lines (face, brows, eyes, smile)
function buildMaskGeometry(): THREE.BufferGeometry[] {
  const geometries: THREE.BufferGeometry[] = [];

  function ellipse(cx:number, cy:number, rx:number, ry:number, pts=64, z=0): THREE.Vector3[] {
    return Array.from({length:pts+1},(_,i)=>{
      const t=(i/pts)*Math.PI*2;
      return new THREE.Vector3(cx+Math.cos(t)*rx, cy+Math.sin(t)*ry, z);
    });
  }
  function arc(cx:number,cy:number,rx:number,ry:number,a0:number,a1:number,pts=32,z=0): THREE.Vector3[] {
    return Array.from({length:pts},(_,i)=>{
      const t=a0+(a1-a0)*(i/(pts-1));
      return new THREE.Vector3(cx+Math.cos(t)*rx, cy+Math.sin(t)*ry, z);
    });
  }
  function linesToGeo(pts: THREE.Vector3[]): THREE.BufferGeometry {
    return new THREE.BufferGeometry().setFromPoints(pts);
  }

  // Outer face
  geometries.push(linesToGeo(ellipse(0,0,1,1.3)));
  // Left eye
  geometries.push(linesToGeo(ellipse(-0.38,0.22,0.22,0.13)));
  // Right eye
  geometries.push(linesToGeo(ellipse(0.38,0.22,0.22,0.13)));
  // Left brow
  geometries.push(linesToGeo(arc(-0.38,0.48,0.28,0.1,Math.PI*1.1,Math.PI*1.9)));
  // Right brow
  geometries.push(linesToGeo(arc(0.38,0.48,0.28,0.1,Math.PI*1.1,Math.PI*1.9)));
  // Smile
  geometries.push(linesToGeo(arc(0,-0.25,0.45,0.25,0.1,Math.PI-0.1)));
  // Nose hint
  geometries.push(linesToGeo(arc(0,0.02,0.1,0.18,-Math.PI*0.7,-Math.PI*0.3)));

  return geometries;
}

function Mask({ position, scale, rotation, opacity }: { position:[number,number,number]; scale:number; rotation:[number,number,number]; opacity:number }) {
  const groupRef = useRef<THREE.Group>(null);
  const geos = useMemo(()=>buildMaskGeometry(),[]);
  const mat = useMemo(()=>new THREE.LineBasicMaterial({ color:"#d6303c", transparent:true, opacity }),[opacity]);
  const matWhite = useMemo(()=>new THREE.LineBasicMaterial({ color:"#f0f0f0", transparent:true, opacity:opacity*0.3 }),[opacity]);

  useFrame((s)=>{
    if(groupRef.current){
      groupRef.current.rotation.y=rotation[1]+Math.sin(s.clock.elapsedTime*0.4+position[0])*0.12;
      groupRef.current.rotation.x=rotation[0]+Math.sin(s.clock.elapsedTime*0.3+position[1])*0.06;
      groupRef.current.position.y=position[1]+Math.sin(s.clock.elapsedTime*0.5+position[2])*0.15;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={rotation}>
      {geos.map((geo,i)=>(
        <line key={i}>
          <primitive object={geo} attach="geometry"/>
          <primitive object={i===0?matWhite:mat} attach="material"/>
        </line>
      ))}
    </group>
  );
}

const MASKS: { pos:[number,number,number]; scale:number; rot:[number,number,number]; op:number }[] = [
  { pos:[3.5, 0.5,-2], scale:1.4, rot:[0.1,-0.4,0.05], op:0.55 },
  { pos:[-3.8,-1,  -3], scale:0.9, rot:[-0.1,0.5,-0.08], op:0.35 },
  { pos:[1.5, 2.5,-4], scale:1.0, rot:[0.2,-0.2, 0.1], op:0.25 },
  { pos:[-1.5,-2.5,-1.5],scale:0.65,rot:[0.05,0.3, 0.05],op:0.45 },
  { pos:[5,  -2,  -5], scale:1.8, rot:[0, 0.6,-0.05], op:0.15 },
  { pos:[-5,  2,  -4], scale:1.2, rot:[0.1,-0.5, 0.1], op:0.2  },
];

function Particles(){
  const ref=useRef<THREE.Points>(null);
  const [pos,sz]=useMemo(()=>{
    const n=400;
    const p=new Float32Array(n*3),s=new Float32Array(n);
    for(let i=0;i<n;i++){
      p[i*3]=(Math.random()-.5)*18;
      p[i*3+1]=(Math.random()-.5)*14;
      p[i*3+2]=(Math.random()-.5)*8;
      s[i]=Math.random()*1.5+.3;
    }
    return [p,s];
  },[]);
  useFrame((_,dt)=>{ if(ref.current) ref.current.rotation.y+=dt*0.015; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos,3]}/>
        <bufferAttribute attach="attributes-size" args={[sz,1]}/>
      </bufferGeometry>
      <pointsMaterial color="#d6303c" size={0.025} sizeAttenuation transparent opacity={0.3}/>
    </points>
  );
}

function SceneContent({ scrollY }: { scrollY: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  useFrame(()=>{
    const y = scrollY.current;
    camera.position.y = -y * 0.003;
    camera.position.x = Math.sin(y*0.001)*0.5;
  });
  return (
    <>
      <Particles />
      {MASKS.map((m,i)=>(
        <Mask key={i} position={m.pos} scale={m.scale} rotation={m.rot} opacity={m.op}/>
      ))}
    </>
  );
}

export default function MaskScene({ scrollY }: { scrollY: React.MutableRefObject<number> }) {
  return (
    <Canvas
      camera={{ position:[0,0,7], fov:55 }}
      dpr={[1,1.5]}
      style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}
      gl={{ antialias:true, alpha:true }}
    >
      <SceneContent scrollY={scrollY} />
    </Canvas>
  );
}
