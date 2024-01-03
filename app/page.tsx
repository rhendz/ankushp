'use client';

import * as THREE from 'three';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import { OrbitControls, PerspectiveCamera, shaderMaterial, useHelper } from '@react-three/drei';

// import fragmentShader from './shaders/fragment.glsl';
// import vertexShader from './shaders/vertex.glsl'; 



const fragmentShader = /*glsl*/ `
  uniform float u_intensity;
  uniform float u_time;

  varying vec2 vUv;
  varying float vDisplacement;

  void main() {
    float distort = 2.0 * vDisplacement * u_intensity;

    vec3 color = vec3(abs(vUv - 0.5) * 2.0  * (1.0 - distort), 1.0);
    
    gl_FragColor = vec4(color ,1.0);
  }
`

const vertexShader = /*glsl*/ `
  uniform float u_intensity;
  uniform float u_time;

  varying vec2 vUv;
  varying float vDisplacement;


  // Classic Perlin 3D Noise 
  // by Stefan Gustavson
  //
  vec4 permute(vec4 x) {
      return mod(((x*34.0)+1.0)*x, 289.0);
  }

  vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
  }

  vec3 fade(vec3 t) {
      return t*t*t*(t*(t*6.0-15.0)+10.0);
  }

  float cnoise(vec3 P) {
      vec3 Pi0 = floor(P); // Integer part for indexing
      vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
      Pi0 = mod(Pi0, 289.0);
      Pi1 = mod(Pi1, 289.0);
      vec3 Pf0 = fract(P); // Fractional part for interpolation
      vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
      vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
      vec4 iy = vec4(Pi0.yy, Pi1.yy);
      vec4 iz0 = Pi0.zzzz;
      vec4 iz1 = Pi1.zzzz;

      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + iz0);
      vec4 ixy1 = permute(ixy + iz1);

      vec4 gx0 = ixy0 / 7.0;
      vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
      gx0 = fract(gx0);
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
      vec4 sz0 = step(gz0, vec4(0.0));
      gx0 -= sz0 * (step(0.0, gx0) - 0.5);
      gy0 -= sz0 * (step(0.0, gy0) - 0.5);

      vec4 gx1 = ixy1 / 7.0;
      vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
      gx1 = fract(gx1);
      vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
      vec4 sz1 = step(gz1, vec4(0.0));
      gx1 -= sz1 * (step(0.0, gx1) - 0.5);
      gy1 -= sz1 * (step(0.0, gy1) - 0.5);

      vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
      vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
      vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
      vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
      vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
      vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
      vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
      vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

      vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
      g000 *= norm0.x;
      g010 *= norm0.y;
      g100 *= norm0.z;
      g110 *= norm0.w;
      vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
      g001 *= norm1.x;
      g011 *= norm1.y;
      g101 *= norm1.z;
      g111 *= norm1.w;

      float n000 = dot(g000, Pf0);
      float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
      float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
      float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
      float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
      float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
      float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
      float n111 = dot(g111, Pf1);

      vec3 fade_xyz = fade(Pf0);
      vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
      vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
      float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
      return 2.2 * n_xyz;
  }

  // End of Perlin Noise Code

  void main() {
    vUv = uv;

    vDisplacement = cnoise(position + vec3(2.0 * u_time));

    vec3 newPosition = position + normal * (u_intensity * vDisplacement);

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
  }
`

// Import Leva only in development
let useControls;
if (process.env.NODE_ENV === 'development') {
  import('leva').then((levaModule) => {
    useControls = levaModule.useControls;
  });
}

const Blob = () => {
  const mesh = useRef<THREE.Mesh>(null)
  const hover = useRef(false)

  const uniforms = useMemo(
    () => ({
      u_intensity: {
        value: 0.15,
      },
      u_time: {
        value: 0.0,
      },
    }),
    []
  );

  useFrame((state) => {
    const { clock } = state;
  
    // Check if mesh.current is defined before accessing its properties
    if (mesh.current && mesh.current.material instanceof THREE.ShaderMaterial) {
      const shaderMaterial = mesh.current.material as THREE.ShaderMaterial;
  
      shaderMaterial.uniforms.u_time.value = 0.4 * clock.getElapsedTime();
  
      shaderMaterial.uniforms.u_intensity.value = THREE.MathUtils.lerp(
        shaderMaterial.uniforms.u_intensity.value,
        hover.current ? 0.85 : 0.15,
        0.02
      );
    }
  });
  
  return (
    <mesh
      ref={mesh}
      position={[0, 0, 0]}
      scale={1.0}
      onPointerOver={() => (hover.current = true)}
      onPointerOut={() => (hover.current = false)}
      castShadow
      receiveShadow
    >
      <icosahedronGeometry args={[1.5, 100]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  );
};

const Scene = () => {
  const dirLight = useRef<THREE.DirectionalLight>(null);
  // useHelper(dirLight, THREE.DirectionalLightHelper, 1, 'red')

  return (
    <>
      <ambientLight intensity={0.5}/>
      <directionalLight position={[0, 5, 2]} ref={dirLight} />
      <Blob />
    </>
  )
}

export default function Home() {
  return (
    <div className='relative h-screen w-full'>
      <Canvas className='z-0 h-full w-full'>
        <color attach="background" args={[new THREE.Color("#0e1111")]}/>
        <Scene />
        <OrbitControls enablePan={false} enableZoom={false}/>
      </Canvas>
      <div className='pointer-events-none absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center'>
        <div className='flex size-56 grow flex-col justify-center bg-transparent text-center '>
          <h1 className='text-8xl font-bold text-white'>Ankush Patel</h1>
          <h2 className='text-6xl font-semibold'><span className='black-border'>ML Engineer</span></h2>
        </div>
      </div>
    </div>
  );
}
