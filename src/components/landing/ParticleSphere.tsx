import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function ParticleCloud() {
  const ref = useRef<THREE.Points>(null);
  const sphereRef = useRef<THREE.Points>(null);
  
  // Generate sphere particles
  const sphereParticles = useMemo(() => {
    const positions = new Float32Array(3000 * 3);
    const radius = 2;
    
    for (let i = 0; i < 3000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, []);

  // Generate ambient particles
  const ambientParticles = useMemo(() => {
    const positions = new Float32Array(500 * 3);
    
    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (sphereRef.current) {
      sphereRef.current.rotation.y = time * 0.1;
      sphereRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
      
      // Morph the sphere
      const positions = sphereRef.current.geometry.attributes.position.array as Float32Array;
      const originalPositions = sphereParticles;
      
      for (let i = 0; i < positions.length; i += 3) {
        const ox = originalPositions[i];
        const oy = originalPositions[i + 1];
        const oz = originalPositions[i + 2];
        
        const noise = Math.sin(ox * 2 + time) * Math.cos(oy * 2 + time * 0.8) * Math.sin(oz * 2 + time * 1.2);
        const scale = 1 + noise * 0.3;
        
        positions[i] = ox * scale;
        positions[i + 1] = oy * scale;
        positions[i + 2] = oz * scale;
      }
      
      sphereRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    if (ref.current) {
      ref.current.rotation.y = time * 0.05;
    }
  });

  return (
    <>
      {/* Main morphing sphere */}
      <Points ref={sphereRef} positions={sphereParticles} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#22d3ee"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      {/* Inner glow sphere */}
      <Points positions={sphereParticles} stride={3} frustumCulled={false} scale={0.7}>
        <PointMaterial
          transparent
          color="#a855f7"
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.6}
        />
      </Points>
      
      {/* Ambient floating particles */}
      <Points ref={ref} positions={ambientParticles} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#06b6d4"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.4}
        />
      </Points>
      
      {/* Core glow */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#1e1b4b" transparent opacity={0.3} />
      </mesh>
    </>
  );
}

export default function ParticleSphere() {
  return (
    <div className="w-full h-[250px] relative">
      {/* Background circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[220px] h-[220px] rounded-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10" />
      </div>
      
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <ParticleCloud />
      </Canvas>
    </div>
  );
}
