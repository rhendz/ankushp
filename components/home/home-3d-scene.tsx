'use client'

import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { advancePointerSpring, BlobQuality } from '@/lib/blob-motion'

type SceneProps = {
  paused: boolean
  onReady: () => void
  onUnavailable: () => void
}

type SceneControls = {
  setPaused: (paused: boolean) => void
  updateTheme: () => void
}

// Keep the original luminous UV color field. This is an authored graphic
// material, so physical specular lighting would change its identity.
const vertexShader = /* glsl */ `
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

const fragmentShader = /* glsl */ `
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

export default function Home3DScene({ paused, onReady, onUnavailable }: SceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<SceneControls | null>(null)
  const { resolvedTheme } = useTheme()
  const pausedRef = useRef(paused)
  useEffect(() => {
    pausedRef.current = paused
    controlsRef.current?.setPaused(paused)
  }, [paused])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    mount.appendChild(canvas)
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      })
    } catch {
      canvas.remove()
      onUnavailable()
      return
    }
    renderer.setClearColor(0x000000, 0)
    // A failed shader must retain the static form rather than report a healthy canvas.
    let shaderFailed = false
    renderer.debug.onShaderError = () => {
      shaderFailed = true
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30)
    camera.position.z = 6.2
    const uniforms = {
      u_time: { value: 0 },
      u_intensity: { value: 0.15 },
      u_hue: { value: 1 },
      u_saturation: { value: 1 },
      u_lightness: { value: 0.05 },
      u_rim_strength: { value: 0.56 },
    }
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })
    let compact = mount.clientWidth < 420
    let dark = document.documentElement.dataset.theme === 'dark'
    // The fine light-mode lattice is part of the original visual identity.
    // The unlit solid material needs less geometry without losing that silhouette.
    const geometry = () => new THREE.IcosahedronGeometry(1.5, dark ? (compact ? 20 : 28) : 48)
    const blob = new THREE.Mesh(geometry(), material)
    blob.rotation.set(-Math.PI / 4, 0, 0)
    const maximumDpr = () => Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2)
    let currentMaximum = maximumDpr()
    const quality = new BlobQuality(currentMaximum)
    const spring = { x: 0, y: 0, vx: 0, vy: 0 }
    scene.add(blob)

    let frame = 0
    let previousTime = 0
    let elapsed = 0
    let running = false
    let isPaused = pausedRef.current
    let intersecting = true
    let lost = false
    let disposed = false
    let ready = false
    let compiled = false
    const targetPointer = new THREE.Vector2()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')

    const stop = () => {
      running = false
      window.cancelAnimationFrame(frame)
      previousTime = 0
      quality.resetTiming()
    }
    const fail = () => {
      if (lost || disposed) return
      lost = true
      stop()
      onUnavailable()
    }
    const render = () => {
      if (lost || disposed || !compiled) return
      try {
        renderer.render(scene, camera)
        if (shaderFailed) {
          fail()
          return
        }
        if (!ready) {
          ready = true
          mount.dataset.ready = 'true'
          onReady()
        }
      } catch {
        fail()
      }
    }
    const canAnimate = () =>
      !isPaused &&
      !reducedMotion.matches &&
      intersecting &&
      !document.hidden &&
      !lost &&
      !disposed &&
      compiled
    const tick = (now: number) => {
      if (!canAnimate()) {
        stop()
        return
      }
      const delta = previousTime ? (now - previousTime) / 1000 : 0
      previousTime = now
      elapsed += delta
      uniforms.u_time.value = elapsed * 0.4
      advancePointerSpring(spring, targetPointer.x, targetPointer.y, delta)
      // Preserve the original continuous turn, with a small weighted response.
      const influence = Math.min(Math.hypot(spring.x, spring.y), 1)
      uniforms.u_intensity.value = 0.15 + influence * 0.02
      blob.rotation.y = elapsed * 0.12 + spring.x * 0.08
      blob.rotation.x = -Math.PI / 4 + spring.y * 0.06
      const ratio = quality.sample(delta * 1000)
      if (ratio !== renderer.getPixelRatio()) renderer.setPixelRatio(ratio)
      render()
      if (!lost) frame = window.requestAnimationFrame(tick)
    }
    const sync = () => {
      if (!canAnimate()) {
        stop()
        return
      }
      if (!running) {
        running = true
        previousTime = 0
        frame = window.requestAnimationFrame(tick)
      }
    }
    const updateTheme = () => {
      const nextDark = document.documentElement.dataset.theme === 'dark'
      if (nextDark !== dark) {
        dark = nextDark
        blob.geometry.dispose()
        blob.geometry = geometry()
      }
      uniforms.u_lightness.value = dark ? 0.05 : 0.2
      uniforms.u_rim_strength.value = dark ? 0.56 : 0
      material.wireframe = !dark
      render()
    }
    const resize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (!w || !h) return
      const nextCompact = w < 420
      if (nextCompact !== compact) {
        compact = nextCompact
        blob.geometry.dispose()
        blob.geometry = geometry()
      }
      const nextMaximum = maximumDpr()
      if (nextMaximum !== currentMaximum) {
        currentMaximum = nextMaximum
        quality.setMaximum(currentMaximum)
      }
      renderer.setPixelRatio(quality.ratio)
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      const scale = Math.min(1, camera.aspect)
      blob.scale.setScalar(scale)
      render()
    }
    const pointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || !canAnimate() || event.pointerType === 'touch') return
      const bounds = mount.getBoundingClientRect()
      targetPointer.set(
        THREE.MathUtils.clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1),
        THREE.MathUtils.clamp(1 - ((event.clientY - bounds.top) / bounds.height) * 2, -1, 1)
      )
    }
    const pointerLeave = () => targetPointer.set(0, 0)
    const contextLost = (event: Event) => {
      event.preventDefault()
      fail()
    }
    controlsRef.current = {
      setPaused(value) {
        isPaused = value
        sync()
      },
      updateTheme,
    }
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting
      sync()
    })
    const sizeObserver = new ResizeObserver(resize)
    observer.observe(mount)
    sizeObserver.observe(mount)
    window.addEventListener('resize', resize)
    mount.addEventListener('pointermove', pointerMove)
    mount.addEventListener('pointerleave', pointerLeave)
    canvas.addEventListener('webglcontextlost', contextLost)
    document.addEventListener('visibilitychange', sync)
    reducedMotion.addEventListener('change', sync)
    // Set colors before the first visible frame.
    updateTheme()
    resize()
    // Let the introduction paint first. Three's compileAsync polling cannot be
    // cancelled safely on context loss/unmount, so use a cancellable idle task.
    const prepare = () => {
      if (disposed || lost) return
      try {
        renderer.compile(scene, camera)
        compiled = true
        render()
        sync()
      } catch {
        fail()
      }
    }
    const useIdle = typeof window.requestIdleCallback === 'function'
    const preparation = useIdle
      ? window.requestIdleCallback(prepare, { timeout: 500 })
      : window.setTimeout(prepare, 0)

    return () => {
      disposed = true
      if (useIdle) window.cancelIdleCallback(preparation)
      else window.clearTimeout(preparation)
      stop()
      controlsRef.current = null
      observer.disconnect()
      sizeObserver.disconnect()
      window.removeEventListener('resize', resize)
      mount.removeEventListener('pointermove', pointerMove)
      mount.removeEventListener('pointerleave', pointerLeave)
      canvas.removeEventListener('webglcontextlost', contextLost)
      document.removeEventListener('visibilitychange', sync)
      reducedMotion.removeEventListener('change', sync)
      blob.geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (!lost) renderer.forceContextLoss()
      canvas.remove()
    }
  }, [onReady, onUnavailable])

  useEffect(() => {
    controlsRef.current?.updateTheme()
  }, [resolvedTheme])

  return (
    <div ref={mountRef} aria-hidden="true" data-testid="blob-canvas" className="absolute inset-0" />
  )
}
