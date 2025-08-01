'use client';
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Trail } from '@react-three/drei';
import { ArrowRight } from 'lucide-react';
import * as THREE from 'three';
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter } from "next/navigation";

// Enhanced shader material with better initialization
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

// Enhanced Electron with proper initialization
type PremiumElectronProps = {
  radius: number;
  speed: number;
  offset: number;
  color?: string;
  trail?: boolean;
  startDelay?: number;
};

function PremiumElectron({ radius, speed, offset, color = '#a855f7', trail = true, startDelay = 0 }: PremiumElectronProps) {
  const electronRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  
  const shaderMaterial = useMemo(() => createAtomShader(), []);

  // Initialize position immediately
  useEffect(() => {
    if (electronRef.current) {
      const initialTime = offset + startDelay;
      const x = Math.cos(initialTime) * radius;
      const z = Math.sin(initialTime) * radius;
      const y = Math.sin(initialTime * 1.5) * 0.4;
      
      electronRef.current.position.set(x, y, z);
      electronRef.current.rotation.y = initialTime * 2;
      electronRef.current.rotation.x = initialTime * 1.3;
      
      // Mark as initialized after a short delay
      setTimeout(() => setIsInitialized(true), 100);
    }
  }, [radius, offset, startDelay]);

  useFrame((state) => {
    if (!isInitialized || !electronRef.current) return;
    
    // Initialize start time on first frame
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }
    
    const adjustedTime = state.clock.elapsedTime - startTimeRef.current + startDelay;
    const time = adjustedTime * speed + offset;
    
    // Enhanced orbital motion with smoother transitions
    const baseX = Math.cos(time) * radius;
    const baseZ = Math.sin(time) * radius;
    const baseY = Math.sin(time * 1.5) * 0.4;
    
    // Add secondary harmonics for more realistic motion
    const perturbX = Math.cos(time * 2.1) * 0.1;
    const perturbZ = Math.sin(time * 1.7) * 0.1;
    const perturbY = Math.cos(time * 0.7) * 0.2;
    
    electronRef.current.position.set(
      baseX + perturbX,
      baseY + perturbY,
      baseZ + perturbZ
    );
    
    electronRef.current.rotation.y = time * 2;
    electronRef.current.rotation.x = time * 1.3;
    
    // Update shader uniforms
    shaderMaterial.uniforms.time.value = adjustedTime;
    shaderMaterial.uniforms.intensity.value = hovered ? 2.5 : 1.5;
    shaderMaterial.uniforms.color.value.setHex(hovered ? 0xc084fc : parseInt(color.replace('#', '0x')));
    
    // Animate glow
    if (glowRef.current) {
      const scale = 1 + Math.sin(adjustedTime * 4) * 0.3;
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
      {/* Main electron with enhanced shader */}
      <mesh material={shaderMaterial}>
        <sphereGeometry args={[0.15, 32, 32]} />
      </mesh>
      
      {/* Multiple glow layers for depth */}
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
      
      {/* Enhanced point light */}
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

// Enhanced Orbital Ring with better initialization
type PremiumOrbitalRingProps = {
  radius: number;
  rotationSpeed?: number;
  opacity?: number;
  segments?: number;
  color?: string;
  startDelay?: number;
};

function PremiumOrbitalRing({ 
  radius, 
  rotationSpeed = 0.005, 
  opacity = 0.4, 
  segments = 128, 
  color = '#a855f7',
  startDelay = 0
}: PremiumOrbitalRingProps) {
  const ringRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Group>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  
  const ringGeometry = useMemo(() => {
    return new THREE.RingGeometry(radius - 0.03, radius + 0.03, segments);
  }, [radius, segments]);

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

  useEffect(() => {
    setTimeout(() => setIsInitialized(true), startDelay);
  }, [startDelay]);

  useFrame((state) => {
    if (!isInitialized) return;
    
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }
    
    const adjustedTime = state.clock.elapsedTime - startTimeRef.current;
    
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
            0.6 + Math.sin(adjustedTime * 2 + data.phase) * 0.4;
        }
        particle.scale.setScalar(0.5 + Math.sin(adjustedTime * 3 + data.phase) * 0.3);
      });
    }
  });

  return (
    <group ref={ringRef}>
      {/* Main ring with gradient effect */}
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
      
      {/* Animated ring particles */}
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

// Enhanced Nucleus with better effects
function PremiumNucleus() {
  const nucleusRef = useRef<THREE.Group>(null);
  const innerCoreRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  
  const nucleusShader = useMemo(() => {
    const shader = createAtomShader();
    shader.uniforms.color.value = new THREE.Color('#c084fc');
    shader.uniforms.intensity.value = 2.5;
    shader.uniforms.glowPower.value = 3.0;
    return shader;
  }, []);

  useEffect(() => {
    setTimeout(() => setIsInitialized(true), 200);
  }, []);

  useFrame((state) => {
    if (!isInitialized) return;
    
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }
    
    const adjustedTime = state.clock.elapsedTime - startTimeRef.current;
    
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
      const scale = 1 + Math.sin(adjustedTime * 2) * 0.1;
      glowRef.current.scale.setScalar(scale * (hovered ? 1.3 : 1));
    }
    
    // Update shader
    nucleusShader.uniforms.time.value = adjustedTime;
    nucleusShader.uniforms.intensity.value = hovered ? 3.5 : 2.5;
  });

  return (
    <group
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Enhanced nucleus with multiple geometries */}
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
      
      {/* Enhanced glow layers */}
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
      
      {/* Animated nucleus particles */}
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

// Enhanced Background with better performance
function PremiumBackground() {
  const particlesRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.Mesh>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const backgroundParticles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 150; i++) {
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

  useEffect(() => {
    setTimeout(() => setIsInitialized(true), 500);
  }, []);

  useFrame((state) => {
    if (!isInitialized) return;
    
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

// Enhanced Camera Controller
function PremiumCameraController() {
  const { camera, mouse } = useThree();
  const targetRef = useRef({ x: 0, y: 0, z: 8 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize camera position
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);
    setTimeout(() => setIsInitialized(true), 100);
  }, [camera]);
  
  useFrame((state) => {
    if (!isInitialized) return;
    
    const mouseInfluence = 0.2;
    targetRef.current.x = mouse.x * mouseInfluence;
    targetRef.current.y = mouse.y * mouseInfluence * 0.3;
    
    camera.position.x += (targetRef.current.x - camera.position.x) * 0.03;
    camera.position.y += (targetRef.current.y - camera.position.y) * 0.03;
    
    const breathe = Math.sin(state.clock.elapsedTime * 0.6) * 0.1;
    const float = Math.cos(state.clock.elapsedTime * 0.4) * 0.05;
    camera.position.z = 8 + breathe;
    camera.position.y += float;
    
    camera.rotation.z = mouse.x * 0.003;
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

// Enhanced Main Atomic Structure
function PremiumAtomicStructure() {
  const groupRef = useRef<THREE.Group>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setIsInitialized(true), 300);
  }, []);
  
  useFrame((state) => {
    if (!isInitialized || !groupRef.current) return;
    
    groupRef.current.rotation.y += 0.002;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.03;
  });

  return (
    <group ref={groupRef} position={[5, 0, 0]}>
      {/* Central Nucleus */}
      <PremiumNucleus />
      
      {/* Orbital Rings with staggered delays */}
      <PremiumOrbitalRing radius={2.2} rotationSpeed={0.008} opacity={0.6} segments={256} startDelay={300} />
      
      <group rotation={[Math.PI / 2.2, 0, 0]}>
        <PremiumOrbitalRing radius={2.8} rotationSpeed={0.006} opacity={0.4} segments={192} color="#8b5cf6" startDelay={500} />
      </group>
      
      <group rotation={[0, Math.PI / 2.2, Math.PI / 3.5]}>
        <PremiumOrbitalRing radius={3.4} rotationSpeed={0.004} opacity={0.3} segments={128} color="#7c3aed" startDelay={700} />
      </group>

      {/* Enhanced Electrons with staggered start delays */}
      <PremiumElectron radius={2.2} speed={1.5} offset={0} color="#a855f7" startDelay={0.5} />
      <PremiumElectron radius={2.2} speed={1.5} offset={Math.PI} color="#a855f7" startDelay={0.8} />
      
      <group rotation={[Math.PI / 2.2, 0, 0]}>
        <PremiumElectron radius={2.8} speed={1.2} offset={0} color="#8b5cf6" startDelay={1.0} />
        <PremiumElectron radius={2.8} speed={1.2} offset={Math.PI / 2} color="#8b5cf6" startDelay={1.3} />
        <PremiumElectron radius={2.8} speed={1.2} offset={Math.PI} color="#8b5cf6" startDelay={1.6} />
        <PremiumElectron radius={2.8} speed={1.2} offset={3 * Math.PI / 2} color="#8b5cf6" startDelay={1.9} />
      </group>
      
      <group rotation={[0, Math.PI / 2.2, Math.PI / 3.5]}>
        <PremiumElectron radius={3.4} speed={0.9} offset={0} color="#7c3aed" startDelay={2.2} />
        <PremiumElectron radius={3.4} speed={0.9} offset={2 * Math.PI / 3} color="#7c3aed" startDelay={2.5} />
        <PremiumElectron radius={3.4} speed={0.9} offset={4 * Math.PI / 3} color="#7c3aed" startDelay={2.8} />
      </group>
    </group>
  );
}

// Main Component with enhanced loading
export default function ThemedAtomicHero() {
  const [loading, setLoading] = useState(true);
  const [atomInitialized, setAtomInitialized] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { isAuthenticated, user } = useKindeAuth();
  const router = useRouter();

  const handleClick = () => {
    if (isAuthenticated) {
      router.push("/services");
    } else {
      router.push("/api/auth/login?post_login_redirect_url=/services");
    }
  };
  
  useEffect(() => {
    // Initial loading
    const initialTimer = setTimeout(() => {
      setLoading(false);
      // Start atom initialization after initial load
      setTimeout(() => setAtomInitialized(true), 200);
    }, 1000);
    
    const handleMouseMove = (e: { clientX: number; clientY: number; }) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="bg-[#0b0b0d] text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 z-50">
          <div className="text-purple-400 text-lg"></div>
        </div>
      )}
      
      {/* Dynamic background effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at ${50 + mousePosition.x * 8}% ${50 + mousePosition.y * 8}%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`
        }}
      />
      
      {/* 3D Atomic Animation */}
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
          <ambientLight intensity={0.2} color="#4c1d95" />
          <directionalLight position={[10, 10, 5]} intensity={0.5} color="#a855f7" />
          <pointLight position={[5, 0, 0]} intensity={1.5} color="#a855f7" distance={10} />
          
          {atomInitialized && (
            <>
              <PremiumBackground />
              <PremiumAtomicStructure />
            </>
          )}
          
          <PremiumCameraController />
          
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
            Plug-and-Play AI APIs
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Built for Enterprise
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl font-light leading-relaxed opacity-90">
            Automica.ai delivers AI solutions engineered for seamless integration
            <br />
            directly into your systems or via our secure, scalable cloud.
            <br/>
            Get production-ready AI, faster.
          </p>
          
          <button
          onClick={handleClick}
          className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-800 rounded-lg text-white font-medium text-lg hover:from-purple-600 hover:to-purple-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
        >
          <span className="mr-3">TRY IT FREE</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        </div>
      </div>
    </div>
  );
}