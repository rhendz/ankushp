'use client'

import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { psrdnoise } from './shaders/psrdnoise'
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

const vertexShader = /* glsl */ `
  uniform float u_time;
  uniform vec2 u_pointer;
  varying vec3 v_normal;
  varying vec3 v_viewPosition;
  varying vec3 v_direction;

  #define FASTROTATION
  ${psrdnoise}

  void main() {
    vec3 n = normalize(position);
    vec3 g1, g2;
    float t = u_time;
    float flow = psrdnoise(n * 1.25 + vec3(0.0, t * 0.07, 0.0), vec3(0.0), t * 0.32, g1);
    float detail = psrdnoise(n * 2.4 + vec3(3.7, 0.0, t * 0.04), vec3(0.0), -t * 0.21, g2);
    float radius = 1.48 + 0.26 * flow + 0.055 * detail;
    vec3 gradient = 0.26 * 1.25 * g1 + 0.055 * 2.4 * g2;

    // A local, smooth pull toward the pointer; include its derivative in lighting.
    vec3 pullDirection = normalize(vec3(u_pointer * 1.1, 0.8));
    float pull = 0.13 * min(length(u_pointer), 1.0) * exp(3.0 * (dot(n, pullDirection) - 1.0));
    radius += pull;
    gradient += 3.0 * pull * pullDirection;
    vec3 tangentGradient = gradient - n * dot(n, gradient);
    vec3 displacedNormal = normalize(n - tangentGradient / radius);
    vec3 p = n * radius;
    v_normal = normalize(normalMatrix * displacedNormal);
    v_direction = n;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    v_viewPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform float u_dark;
  uniform vec3 u_indigo;
  uniform vec3 u_violet;
  uniform vec3 u_cyan;
  uniform vec3 u_pink;
  varying vec3 v_normal;
  varying vec3 v_viewPosition;
  varying vec3 v_direction;

  void main() {
    vec3 n = normalize(v_normal);
    vec3 view = normalize(-v_viewPosition);
    vec3 light = normalize(vec3(-0.65, 0.85, 1.4));
    float facing = max(dot(n, view), 0.0);
    float fresnel = pow(1.0 - facing, 3.0);
    float vertical = smoothstep(-0.7, 0.8, v_direction.y);
    float across = smoothstep(-0.7, 0.9, v_direction.x + v_direction.z * 0.15);
    vec3 cool = mix(u_cyan, u_indigo, vertical);
    vec3 warm = mix(u_cyan * 0.7 + vec3(0.3), u_pink, vertical);
    vec3 base = mix(cool, warm, across * 0.86);
    base = mix(base, u_violet, smoothstep(0.0, 0.9, v_direction.y) * (1.0 - across) * 0.5);

    float diffuse = max(dot(n, light), 0.0);
    vec3 halfVector = normalize(light + view);
    float highlight = pow(max(dot(n, halfVector), 0.0), 48.0);
    float softHighlight = pow(max(dot(n, halfVector), 0.0), 7.0);
    vec3 fillDirection = normalize(vec3(0.8, -0.5, 0.5));
    float fill = max(dot(n, fillDirection), 0.0);
    vec3 color = base * (0.42 + diffuse * 0.46 + fill * 0.22);
    color += vec3(0.75, 0.85, 1.0) * (highlight * 0.48 + softHighlight * 0.12);
    color += mix(u_pink, u_cyan, facing) * fresnel * mix(0.2, 0.55, u_dark);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
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
    camera.position.z = 7
    const uniforms = {
      u_time: { value: 0 },
      u_pointer: { value: new THREE.Vector2() },
      u_indigo: { value: new THREE.Color('#4438ff') },
      u_violet: { value: new THREE.Color('#872bff') },
      u_cyan: { value: new THREE.Color('#25e6ff') },
      u_pink: { value: new THREE.Color('#e457ff') },
      u_dark: { value: 0 },
    }
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })
    let compact = mount.clientWidth < 420
    const geometry = () => new THREE.SphereGeometry(1, compact ? 48 : 64, compact ? 32 : 48)
    const blob = new THREE.Mesh(geometry(), material)
    blob.rotation.set(-0.18, 0.2, -0.1)
    const maximumDpr = () => Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 1.75)
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
      uniforms.u_time.value = elapsed
      advancePointerSpring(spring, targetPointer.x, targetPointer.y, delta)
      uniforms.u_pointer.value.set(spring.x, spring.y)
      blob.rotation.y = 0.2 + Math.sin(elapsed * 0.14) * 0.18 + spring.x * 0.18
      blob.rotation.x = -0.18 + spring.y * 0.1
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
      uniforms.u_dark.value = document.documentElement.dataset.theme === 'dark' ? 1 : 0
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
