'use client'

import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

const fragmentShader = /*glsl*/ `
  uniform float u_intensity;
  uniform float u_time;

  uniform float u_hue;
  uniform float u_saturation;
  uniform float u_lightness;
  uniform float u_rim_strength;

  varying vec2 vUv;
  varying float vDisplacement;

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

    vec3 baseColor = vec3(abs(vUv - 0.5) * 2.0 * (1.0 - distort), 1.0);
    vec3 hsl = rgb2hsl(baseColor);

    hsl.x = mod(hsl.x + u_hue, 1.0);
    hsl.y = clamp(hsl.y * u_saturation, 0.0, 1.0);
    hsl.z = clamp(hsl.z + u_lightness, 0.0, 1.0);

    vec3 finalColor = hsl2rgb(hsl);

    float centerDistance = length((vUv - 0.5) * 2.0);
    float rim = smoothstep(0.35, 1.0, centerDistance);
    finalColor += vec3(0.14, 0.16, 0.22) * rim * u_rim_strength;
    finalColor = clamp(finalColor, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

const vertexShader = /*glsl*/ `
  uniform float u_intensity;
  uniform float u_time;

  varying vec2 vUv;
  varying float vDisplacement;

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
    vec3 Pi0 = floor(P);
    vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
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

export default function Home3DScene() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'
  const [sceneVisible, setSceneVisible] = useState(false)

  const uniforms = useMemo(
    () => ({
      u_intensity: { value: 0.15 },
      u_time: { value: 0.0 },
      u_hue: { value: 1.0 },
      u_saturation: { value: 1.0 },
      u_lightness: { value: 0.2 },
      u_rim_strength: { value: 0.0 },
    }),
    []
  )

  useEffect(() => {
    const mountEl = mountRef.current
    if (!mountEl) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100)
    camera.position.set(0, 0, 9)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    mountEl.appendChild(renderer.domElement)

    const geometry = new THREE.IcosahedronGeometry(1.5, 100)
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      wireframe: !isDarkMode,
    })

    const blob = new THREE.Mesh(geometry, material)
    blob.rotation.set(-Math.PI / 4, 0, 0)
    scene.add(blob)

    let haloTexture: THREE.CanvasTexture | null = null
    let haloSprite: THREE.Sprite | null = null

    if (isDarkMode) {
      const size = 256
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
        gradient.addColorStop(0, 'rgba(180, 208, 255, 0.42)')
        gradient.addColorStop(0.35, 'rgba(140, 185, 255, 0.22)')
        gradient.addColorStop(0.7, 'rgba(120, 160, 255, 0.08)')
        gradient.addColorStop(1, 'rgba(120, 160, 255, 0)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, size, size)

        haloTexture = new THREE.CanvasTexture(canvas)
        const spriteMat = new THREE.SpriteMaterial({
          map: haloTexture,
          color: '#a4bfff',
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false,
        })
        haloSprite = new THREE.Sprite(spriteMat)
        haloSprite.position.set(0, 0, -0.25)
        scene.add(haloSprite)
      }
    }

    const resize = () => {
      const w = mountEl.clientWidth || window.innerWidth
      const h = mountEl.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)

      const isMobile = window.matchMedia('(max-width: 768px)').matches
      const scale = isMobile ? 0.95 : 1.2
      blob.scale.set(scale, scale, scale)
      if (haloSprite) {
        const haloScale = scale * 4.8
        haloSprite.scale.set(haloScale, haloScale, 1)
      }
    }

    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    let firstFrame = false
    const clock = new THREE.Clock()

    const tick = () => {
      uniforms.u_time.value = 0.4 * clock.getElapsedTime()
      uniforms.u_lightness.value = isDarkMode ? 0.05 : 0.2
      uniforms.u_rim_strength.value = isDarkMode ? 0.56 : 0.0
      material.wireframe = !isDarkMode

      blob.rotation.y += 0.002
      renderer.render(scene, camera)

      if (!firstFrame) {
        firstFrame = true
        setSceneVisible(true)
      }

      raf = window.requestAnimationFrame(tick)
    }

    tick()

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)

      scene.remove(blob)
      geometry.dispose()
      material.dispose()

      if (haloSprite) {
        scene.remove(haloSprite)
        const mat = haloSprite.material as THREE.Material
        mat.dispose()
      }

      haloTexture?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [isDarkMode, uniforms])

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 transition-opacity duration-500 ease-out ${sceneVisible ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}
