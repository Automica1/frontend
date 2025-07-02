'use client';
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Trail } from '@react-three/drei';
import { ArrowRight } from 'lucide-react';
import * as THREE from 'three';

// Custom shader material for premium effects
const createAtomShader = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color('#a855f7') },
      intensity: { value: 1.0 },
      glowPower: { value: 2.0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      uniform float time;
      
      // Simple noise function
      float noise(vec3 p) {
        return sin(p.x * 10.0) * sin(p.y * 10.0) * sin(p.z * 10.0) * 0.1;
      }
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        vec3 pos = position;
        float n = noise(pos + time * 0.5) * 0.1;
        pos += normal * n;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vPosition = mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      uniform float intensity;
      uniform float glowPower;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      
      void main() {
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float fresnel = 1.0 - dot(viewDirection, vNormal);
        fresnel = pow(fresnel, glowPower);
        
        float pulse = sin(time * 3.0) * 0.2 + 0.8;
        vec3 glowColor = color * intensity * pulse;
        
        float rim = fresnel * intensity;
        vec3 finalColor = mix(glowColor * 0.4, glowColor, rim);
        
        float alpha = fresnel * 0.9 + 0.1;
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
};

// Premium Electron with advanced effects
type PremiumElectronProps = {
  radius: number;
  speed: number;
  offset: number;
  color?: string;
  trail?: boolean;
};

function PremiumElectron({ radius, speed, offset, color = '#a855f7', trail = true }: PremiumElectronProps) {
  const electronRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const shaderMaterial = useMemo(() => createAtomShader(), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime * speed + offset;
    if (electronRef.current) {
      // Complex orbital motion with multiple harmonics
      const x = Math.cos(time) * radius + Math.cos(time * 2.1) * 0.1;
      const z = Math.sin(time) * radius + Math.sin(time * 1.7) * 0.1;
      const y = Math.sin(time * 1.5) * 0.4 + Math.cos(time * 0.7) * 0.2;
      
      electronRef.current.position.set(x, y, z);
      electronRef.current.rotation.y = time * 2;
      electronRef.current.rotation.x = time * 1.3;
      
      // Update shader uniforms
      shaderMaterial.uniforms.time.value = state.clock.elapsedTime;
      shaderMaterial.uniforms.intensity.value = hovered ? 2.5 : 1.5;
      shaderMaterial.uniforms.color.value.setHex(hovered ? 0xc084fc : parseInt(color.replace('#', '0x')));
    }
    
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      glowRef.current.scale.setScalar(scale * (hovered ? 1.5 : 1));
    }
  });

  const ElectronComponent = () => (
    <group
      ref={electronRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      scale={hovered ? 1.3 : 1}
    >
      {/* Main electron with shader */}
      <mesh material={shaderMaterial}>
        <sphereGeometry args={[0.15, 32, 32]} />
      </mesh>
      
      {/* Multiple glow layers */}
      <mesh ref={glowRef} scale={2}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.3 : 0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      <mesh scale={3}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Core light */}
      <pointLight color={color} intensity={hovered ? 3 : 1.5} distance={2} />
    </group>
  );

  return trail ? (
    <Trail
      width={hovered ? 1.5 : 0.8}
      length={15}
      color={color}
      attenuation={(t) => t * t * t}
    >
      <ElectronComponent />
    </Trail>
  ) : (
    <ElectronComponent />
  );
}

// Premium Orbital Ring
type PremiumOrbitalRingProps = {
  radius: number;
  rotationSpeed?: number;
  opacity?: number;
  segments?: number;
  color?: string;
};

function PremiumOrbitalRing({ radius, rotationSpeed = 0.005, opacity = 0.4, segments = 128, color = '#a855f7' }: PremiumOrbitalRingProps) {
  const ringRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Group>(null);
  
  // Create ring geometry
  const ringGeometry = useMemo(() => {
    const geometry = new THREE.RingGeometry(radius - 0.03, radius + 0.03, segments);
    return geometry;
  }, [radius, segments]);

  // Create ring particles
  const ringParticles = useMemo(() => {
    const particles = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      particles.push({
        position: [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ],
        phase: i
      });
    }
    return particles;
  }, [radius]);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x += rotationSpeed * 0.6;
      ringRef.current.rotation.y += rotationSpeed * 0.4;
      ringRef.current.rotation.z += rotationSpeed * 0.2;
    }
    
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        const data = ringParticles[i];
        if ((particle as THREE.Mesh).material && 'opacity' in (particle as THREE.Mesh).material) {
          ((particle as THREE.Mesh).material as THREE.Material & { opacity: number }).opacity =
            0.6 + Math.sin(state.clock.elapsedTime * 2 + data.phase) * 0.4;
        }
        particle.scale.setScalar(0.5 + Math.sin(state.clock.elapsedTime * 3 + data.phase) * 0.3);
      });
    }
  });

  return (
    <group ref={ringRef}>
      {/* Main ring */}
      <mesh geometry={ringGeometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Ring edge glow */}
      <mesh geometry={ringGeometry} scale={1.1}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Ring particles */}
      <group ref={particlesRef}>
        {ringParticles.map((particle, i) => (
          <mesh key={i} position={particle.position as [number, number, number]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Premium Nucleus
function PremiumNucleus() {
  const nucleusRef = useRef<THREE.Group>(null);
  const innerCoreRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const nucleusShader = useMemo(() => {
    const shader = createAtomShader();
    shader.uniforms.color.value = new THREE.Color('#c084fc');
    shader.uniforms.intensity.value = 2.5;
    shader.uniforms.glowPower.value = 3.0;
    return shader;
  }, []);

  useFrame((state) => {
    if (nucleusRef.current) {
      nucleusRef.current.rotation.x += 0.02;
      nucleusRef.current.rotation.y += 0.025;
      nucleusRef.current.rotation.z += 0.015;
    }
    
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.x -= 0.015;
      innerCoreRef.current.rotation.y -= 0.02;
      innerCoreRef.current.rotation.z += 0.01;
    }
    
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.scale.setScalar(scale * (hovered ? 1.3 : 1));
    }
    
    // Update shader
    nucleusShader.uniforms.time.value = state.clock.elapsedTime;
    nucleusShader.uniforms.intensity.value = hovered ? 3.5 : 2.5;
  });

  return (
    <group
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Main nucleus */}
      <mesh ref={nucleusRef} material={nucleusShader} scale={hovered ? 1.3 : 1}>
        <icosahedronGeometry args={[0.5, 2]} />
        <pointLight color="#a855f7" intensity={hovered ? 5 : 3} distance={12} />
      </mesh>
      
      {/* Inner rotating core */}
      <mesh ref={innerCoreRef} scale={0.7}>
        <octahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial
          color="#c084fc"
          transparent
          opacity={0.8}
          roughness={0}
          metalness={1}
          emissive="#4c1d95"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Multiple glow layers */}
      <group ref={glowRef}>
        {[1.8, 2.5, 3.2].map((scale, i) => (
          <mesh key={i} scale={scale}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial
              color="#a855f7"
              transparent
              opacity={0.15 / (i + 1)}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
      
      {/* Nucleus energy particles */}
      <group>
        {Array.from({ length: 20 }, (_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2
            ]}
          >
            <sphereGeometry args={[0.01, 6, 6]} />
            <meshBasicMaterial
              color="#c084fc"
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Advanced Background
function PremiumBackground() {
  const particlesRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.Mesh>(null);
  
  const backgroundParticles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 200; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50
        ],
        scale: Math.random() * 1.2 + 0.3,
        speed: Math.random() * 0.03 + 0.01,
        color: ['#a855f7', '#8b5cf6', '#c084fc'][Math.floor(Math.random() * 3)]
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        const data = backgroundParticles[i];
        particle.position.y += Math.sin(state.clock.elapsedTime * data.speed + i) * 0.008;
        particle.position.x += Math.cos(state.clock.elapsedTime * data.speed * 0.5 + i) * 0.004;
        const mat = (particle as THREE.Mesh).material;
        if (!Array.isArray(mat) && 'opacity' in mat) {
          (mat as THREE.Material & { opacity: number }).opacity = 0.1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;
        }
        particle.rotation.z += data.speed * 0.5;
      });
    }
    
    if (gridRef.current) {
      gridRef.current.rotation.y += 0.001;
      if (gridRef.current.material && 'opacity' in gridRef.current.material) {
        (gridRef.current.material as THREE.Material & { opacity: number }).opacity = 0.05 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      }
    }
  });

  return (
    <>
      {/* Background particles */}
      <group ref={particlesRef}>
        {backgroundParticles.map((particle, i) => (
          <mesh key={i} position={particle.position as [number, number, number]} scale={particle.scale}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshBasicMaterial
              color={particle.color}
              transparent
              opacity={0.2}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
      
      {/* Distant grid sphere */}
      <mesh ref={gridRef} scale={25}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#4c1d95"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          wireframe={true}
        />
      </mesh>
    </>
  );
}

// Advanced Camera System - Fixed to show atom on the right
function PremiumCameraController() {
  const { camera, mouse } = useThree();
  const targetRef = useRef({ x: 0, y: 0, z: 8 });
  
  useFrame((state) => {
    // Enhanced mouse parallax
    const mouseInfluence = 0.2;
    targetRef.current.x = mouse.x * mouseInfluence;
    targetRef.current.y = mouse.y * mouseInfluence * 0.3;
    
    // Smooth camera movement with easing
    camera.position.x += (targetRef.current.x - camera.position.x) * 0.03;
    camera.position.y += (targetRef.current.y - camera.position.y) * 0.03;
    
    // Dynamic breathing and floating motion
    const breathe = Math.sin(state.clock.elapsedTime * 0.6) * 0.1;
    const float = Math.cos(state.clock.elapsedTime * 0.4) * 0.05;
    camera.position.z = 8 + breathe;
    camera.position.y += float;
    
    // Subtle rotation for immersion
    camera.rotation.z = mouse.x * 0.003;
    
    // Look at center
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

// Main Premium Atomic Structure - positioned to the right
function PremiumAtomicStructure() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[5, 0, 0]}>
      {/* Central Nucleus */}
      <PremiumNucleus />
      
      {/* Orbital Rings - Multiple layers */}
      <PremiumOrbitalRing radius={2.2} rotationSpeed={0.008} opacity={0.6} segments={256} />
      
      <group rotation={[Math.PI / 2.2, 0, 0]}>
        <PremiumOrbitalRing radius={2.8} rotationSpeed={0.006} opacity={0.4} segments={192} color="#8b5cf6" />
      </group>
      
      <group rotation={[0, Math.PI / 2.2, Math.PI / 3.5]}>
        <PremiumOrbitalRing radius={3.4} rotationSpeed={0.004} opacity={0.3} segments={128} color="#7c3aed" />
      </group>

      {/* Premium Electrons - Multiple orbital shells */}
      {/* First shell */}
      <PremiumElectron radius={2.2} speed={1.5} offset={0} color="#a855f7" />
      <PremiumElectron radius={2.2} speed={1.5} offset={Math.PI} color="#a855f7" />
      
      {/* Second shell */}
      <group rotation={[Math.PI / 2.2, 0, 0]}>
        <PremiumElectron radius={2.8} speed={1.2} offset={0} color="#8b5cf6" />
        <PremiumElectron radius={2.8} speed={1.2} offset={Math.PI / 2} color="#8b5cf6" />
        <PremiumElectron radius={2.8} speed={1.2} offset={Math.PI} color="#8b5cf6" />
        <PremiumElectron radius={2.8} speed={1.2} offset={3 * Math.PI / 2} color="#8b5cf6" />
      </group>
      
      {/* Third shell */}
      <group rotation={[0, Math.PI / 2.2, Math.PI / 3.5]}>
        <PremiumElectron radius={3.4} speed={0.9} offset={0} color="#7c3aed" />
        <PremiumElectron radius={3.4} speed={0.9} offset={2 * Math.PI / 3} color="#7c3aed" />
        <PremiumElectron radius={3.4} speed={0.9} offset={4 * Math.PI / 3} color="#7c3aed" />
      </group>
    </group>
  );
}

// Premium Atom Loader Component
function PremiumAtomLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0b0d]">
      {/* Background gradient for loader */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black"></div>
      
      {/* Loader container */}
      <div className="relative">
        <style jsx>{`
          .atom-loader {
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            animation: pulse 2s infinite ease-in-out;
          }
          
          .atom-ring {
            position: absolute;
            width: 190px;
            height: 190px;
            border: 1px solid transparent;
            border-radius: 50%;
            border-bottom: 8px solid var(--ring-color);
            animation: rotate1 1s ease-in-out infinite;
            box-shadow: 0 0 4px rgba(142, 142, 142, 0.3);
          }
          
          @keyframes rotate1 {
            from { transform: rotateX(50deg) rotateZ(110deg); }
            to { transform: rotateX(50deg) rotateZ(470deg); }
          }
          
          .atom-ring:nth-child(2) {
            --ring-color: #8f51ea;
            animation-name: rotate2;
          }
          
          @keyframes rotate2 {
            from { transform: rotateX(20deg) rotateY(50deg) rotateZ(20deg); }
            to { transform: rotateX(20deg) rotateY(50deg) rotateZ(380deg); }
          }
          
          .atom-ring:nth-child(3) {
            --ring-color: #0044ff;
            animation-name: rotate3;
          }
          
          @keyframes rotate3 {
            from { transform: rotateX(40deg) rotateY(130deg) rotateZ(450deg); }
            to { transform: rotateX(40deg) rotateY(130deg) rotateZ(90deg); }
          }
          
          .atom-ring:nth-child(4) {
            --ring-color: #fe53bb;
            animation-name: rotate4;
            width: 380px;
            height: 380px;
            border: 2px solid transparent;
            border-bottom: 16px solid var(--ring-color);
          }
          
          @keyframes rotate4 {
            from { transform: rotateX(50deg) rotateZ(470deg); }
            to { transform: rotateX(50deg) rotateZ(110deg); }
          }
          
          .atom-ring:nth-child(5) {
            --ring-color: #8f51ea;
            animation-name: rotate5;
            width: 380px;
            height: 380px;
            border: 2px solid transparent;
            border-bottom: 16px solid var(--ring-color);
          }
          
          @keyframes rotate5 {
            from { transform: rotateX(20deg) rotateY(50deg) rotateZ(380deg); }
            to { transform: rotateX(20deg) rotateY(50deg) rotateZ(20deg); }
          }
          
          .atom-ring:nth-child(6) {
            --ring-color: #0044ff;
            animation-name: rotate6;
            width: 380px;
            height: 380px;
            border: 2px solid transparent;
            border-bottom: 16px solid var(--ring-color);
          }
          
          @keyframes rotate6 {
            from { transform: rotateX(40deg) rotateY(130deg) rotateZ(90deg); }
            to { transform: rotateX(40deg) rotateY(130deg) rotateZ(450deg); }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
              box-shadow: 0 0 20px #fe53bb, 0 0 40px #8f51ea;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.2);
              box-shadow: 0 0 30px #fe53bb, 0 0 60px #8f51ea;
            }
          }
          
          .atom-nucleus {
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, #fe53bb, #8f51ea);
            border-radius: 50%;
            box-shadow: 0px 0 20px #fe53bb, 0 0 40px #8f51ea;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: pulse 1s ease-in-out infinite;
          }
          
          /* Ring color variables */
          .atom-ring:nth-child(1) { --ring-color: #fe53bb; }
          .atom-ring:nth-child(2) { --ring-color: #8f51ea; }
          .atom-ring:nth-child(3) { --ring-color: #0044ff; }
          .atom-ring:nth-child(4) { --ring-color: #fe53bb; }
          .atom-ring:nth-child(5) { --ring-color: #8f51ea; }
          .atom-ring:nth-child(6) { --ring-color: #0044ff; }
        `}</style>
        
        <div className="atom-loader">
          <div className="atom-nucleus" />
          <div className="atom-ring" />
          <div className="atom-ring" />
          <div className="atom-ring" />
          <div className="atom-ring" />
          <div className="atom-ring" />
          <div className="atom-ring" />
        </div>
        
        {/* Loading text */}
        {/* <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-white text-lg font-light tracking-wider animate-pulse">
            Initializing Atomic Intelligence...
          </p>
        </div> */}
      </div>
    </div>
  );
}

// Main Premium Component
export default function ThemedAtomicHero() {
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    
    const handleMouseMove = (e: { clientX: number; clientY: number; }) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className=" bg-[#0b0b0d] text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Loading Screen */}
      {loading && (
        <PremiumAtomLoader />
      )}
      
      {/* Dynamic background effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at ${50 + mousePosition.x * 8}% ${50 + mousePosition.y * 8}%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`
        }}
      />
      
      {/* 3D Atomic Animation Container */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
          style={{ background: 'transparent' }}
        >
          {/* Lighting Setup */}
          <ambientLight intensity={0.2} color="#4c1d95" />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.5} 
            color="#a855f7"
          />
          <pointLight position={[5, 0, 0]} intensity={1.5} color="#a855f7" distance={10} />
          
          {/* Background */}
          <PremiumBackground />
          
          {/* Main Atomic Structure */}
          <PremiumAtomicStructure />
          
          {/* Camera Control */}
          <PremiumCameraController />
          
          {/* Controls */}
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.2}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 2.8}
            dampingFactor={0.1}
            enableDamping={true}
            rotateSpeed={0.15}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl">
          <h1 className="text-5xl lg:text-7xl font-light text-white tracking-tighter leading-tight mb-8">
            Intelligent Solutions
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">for Document AI</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl font-light leading-relaxed opacity-90">
            Automica.ai delivers AI solutions engineered for
            <br />
            QR masking, face verification, sign extraction, and document intelligence.
          </p>
          
          <button className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-800 rounded-lg text-white font-medium text-lg hover:from-purple-600 hover:to-purple-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            <span className="mr-3">TRY IT FREE</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}