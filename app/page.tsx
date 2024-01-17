"use client";

import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from "next/link";
import { OrbitControls } from '@react-three/drei'
// import { Leva, useControls } from 'leva';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { FaEnvelope, FaLinkedin, FaGithub, FaXTwitter } from 'react-icons/fa6';

import Navbar from '@/components/navbar';
import { useTheme } from '@/components/theme-provider';

const fragmentShader = /*glsl*/ `
  uniform float u_intensity;
  uniform float u_time;

  // Uniforms for modifying HSL
  uniform float u_hue;
  uniform float u_saturation;
  uniform float u_lightness;

  varying vec2 vUv;
  varying float vDisplacement;
  
  // Helper functions for converting between RGB and HSL
  vec3 rgb2hsl(vec3 color) {
    vec3 hsl;
    float maxVal = max(max(color.r, color.g), color.b);
    float minVal = min(min(color.r, color.g), color.b);

    hsl.z = (maxVal + minVal) / 2.0;

    float delta = maxVal - minVal;

    if (delta == 0.0) {
        hsl.x = 0.0;
        hsl.y = 0.0;
    } else {
        hsl.y = (hsl.z < 0.5) ? (delta / (maxVal + minVal)) : (delta / (2.0 - maxVal - minVal));

        if (maxVal == color.r) {
            hsl.x = (color.g - color.b) / delta + ((color.g < color.b) ? 6.0 : 0.0);
        } else if (maxVal == color.g) {
            hsl.x = (color.b - color.r) / delta + 2.0;
        } else {
            hsl.x = (color.r - color.g) / delta + 4.0;
        }

        hsl.x /= 6.0;
    }

    return hsl;
  }

  float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0 / 2.0) return q;
    if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
    return p;
  }

  vec3 hsl2rgb(vec3 hsl) {
    vec3 rgb;
    if (hsl.y == 0.0) {
        rgb = vec3(hsl.z);
    } else {
        float q = (hsl.z < 0.5) ? (hsl.z * (1.0 + hsl.y)) : (hsl.z + hsl.y - (hsl.z * hsl.y));
        float p = 2.0 * hsl.z - q;
        rgb.r = hue2rgb(p, q, hsl.x + 1.0 / 3.0);
        rgb.g = hue2rgb(p, q, hsl.x);
        rgb.b = hue2rgb(p, q, hsl.x - 1.0 / 3.0);
    }
    return rgb;
  }

  void main() {
    float distort = 2.0 * vDisplacement * u_intensity;

    // Using HSL color space for better control over lightness
    vec3 baseColor = vec3(abs(vUv - 0.5) * 2.0  * (1.0 - distort), 1.0);

    // Convert to HSL
    vec3 hsl = rgb2hsl(baseColor);

    // Update hue, saturation, and lightness from uniform variables
    hsl.x = mod(hsl.x + u_hue, 1.0); // Apply hue (looped)
    hsl.y = clamp(hsl.y * u_saturation, 0.0, 1.0); // Apply saturation
    hsl.z = clamp(hsl.z + u_lightness, 0.0, 1.0);
    
    // Convert back to RGB
    vec3 finalColor = hsl2rgb(hsl);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const vertexShader = /*glsl*/ `
  uniform float u_intensity;
  uniform float u_time;

  varying vec2 vUv;
  varying float vDisplacement;


  // Classic Perlin 3D Noise 
  // by Stefan Gustavson
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

// // Import Leva only in development
// let useControls;
// if (process.env.NODE_ENV === 'development') {
//   import('leva').then((levaModule) => {
//     useControls = levaModule.useControls;
//   });
// }

const Blob = ( {darkMode = false} ) => {
  const mesh = useRef<THREE.Mesh>(null)
  const hover = useRef(false)

  // Leva Controls
  // const { hue, saturation, lightness } = useControls({
  //   hue: { value: 1.0, min: 0.0, max: 1.0 },
  //   saturation: { value: 1.0, min: 0.0, max: 1.0 },
    // lightness: { value: 0.0, min: 0.0, max: 1.0 },
  // });

  const uniforms = useMemo(
    () => ({
      u_intensity: {
        value: 0.15,
      },
      u_time: {
        value: 0.0,
      },
      u_hue: { value: 1.0 },
      u_saturation: { value: 1.0 },
      u_lightness: { value: 0.2 },
    }),
    // [hue, saturation, lightness]
    []
  );

  useFrame((state) => {
    const { clock } = state;
  
    // Check if mesh.current is defined before accessing its properties
    if (mesh.current && mesh.current.material instanceof THREE.ShaderMaterial) {
      const shaderMaterial = mesh.current.material as THREE.ShaderMaterial;
  
      // Dev setting to refresh shaders
      // shaderMaterial.dispose();

      shaderMaterial.uniforms.u_time.value = 0.4 * clock.getElapsedTime();
  
      shaderMaterial.uniforms.u_intensity.value = THREE.MathUtils.lerp(
        shaderMaterial.uniforms.u_intensity.value,
        hover.current ? 0.85 : 0.15,
        0.02
      );

      // shaderMaterial.uniforms.u_lightness.value = THREE.MathUtils.lerp(
      //   shaderMaterial.uniforms.u_intensity.value,
      //   darkMode ? 0.0 : 2.0,
      //   0.01
      // );

      shaderMaterial.uniforms.u_lightness.value = darkMode ? 0.0 : 0.2;

      // shaderMaterial.uniforms.u_hue.value = hue;
      // shaderMaterial.uniforms.u_saturation.value = saturation;
      // shaderMaterial.uniforms.u_lightness.value = lightness;
    }
  });

  return (
    <mesh
      ref={mesh}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 4, 0, 0]}
      scale={1.0}
      onPointerOver={() => (hover.current = true)}
      onPointerOut={() => (hover.current = false)}
    >
      <icosahedronGeometry args={[2, 100]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        wireframe={darkMode ? false : true}
      />
    </mesh>
  );
};

export default function Home() {
  const { isDarkMode } = useTheme();

  return (
    <div className='flex h-screen w-screen flex-col items-center'>
      <Navbar />
      <div className='relative mt-20 min-h-20 w-full flex-initial basis-4/5 items-center justify-center'>
        <Canvas>
          {/* Canvas components */}
          <Blob darkMode={isDarkMode} />
          <OrbitControls enablePan={false} enableZoom={false} />
          {isDarkMode && (
            <EffectComposer>
              <Bloom intensity={0.2} luminanceThreshold={0.1} />
            </EffectComposer>
          )}
        </Canvas>
        {/* HeroHeadline centered on top of the Canvas */}
        <div className='absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 select-none text-center'>
          <h1 className='whitespace-nowrap text-4xl font-extrabold text-content lg:text-8xl'>Ankush Patel</h1>
          <h2 className='whitespace-nowrap font-mono text-2xl text-content lg:text-4xl'>ML Engineer</h2>
        </div>
      </div>
      
      {/* Social links */}
      <div className="flex w-full max-w-screen-md flex-initial basis-1/5 flex-wrap items-center justify-around px-8 pb-32 text-4xl">
        <Link href="mailto:ap@ankushp.com" className="text-content hover:text-accent1" target="_blank" rel="noopener noreferrer">
          <FaEnvelope/>
        </Link>
        <Link href="https://www.linkedin.com/in/ankush-p/" className="text-content hover:text-accent1" target="_blank" rel="noopener noreferrer">
          <FaLinkedin/>
        </Link>
        <Link href="https://github.com/rhendz" className="text-content hover:text-accent1" target="_blank" rel="noopener noreferrer">
          <FaGithub/>
        </Link>
        <Link href="https://twitter.com/ankushp98" className="text-content hover:text-accent1" target="_blank" rel="noopener noreferrer">
          <FaXTwitter/>
        </Link>
      </div>
    </div>
  );
}
