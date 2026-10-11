'use client'

import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

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
  varying vec3 v_position;
  varying vec3 v_viewPosition;

  void main() {
    float t = u_time;
    vec3 p = position;
    float wave = sin(p.x * 2.2 + t * 0.48) * cos(p.y * 1.8 - t * 0.32);
    wave += 0.45 * sin(p.z * 2.8 + p.y * 1.3 + t * 0.25);
    float influence = dot(normal.xy, u_pointer) * 0.07;
    p += normal * (wave * 0.22 + influence);
    v_position = p;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    v_viewPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 u_surface;
  uniform vec3 u_ink;
  uniform vec3 u_accent;
  uniform float u_dark;
  varying vec3 v_position;
  varying vec3 v_viewPosition;

  void main() {
    vec3 normal = normalize(cross(dFdx(v_viewPosition), dFdy(v_viewPosition)));
    vec3 light = normalize(vec3(-0.65, 0.85, 1.2));
    float diffuse = max(dot(normal, light), 0.0);
    float facing = max(dot(normal, normalize(-v_viewPosition)), 0.0);
    float rim = pow(1.0 - facing, 2.2);
    float warmth = (1.0 - smoothstep(-1.4, 0.6, v_position.y)) * 0.58 + 0.12;
    vec3 base = mix(u_surface, u_accent, warmth);
    vec3 color = base * (0.58 + diffuse * 0.48);
    color = mix(color, u_accent, rim * (0.14 + u_dark * 0.12));

    float contour = (v_position.y + 0.14 * sin(v_position.x * 2.5) + 0.10 * v_position.z) * 10.0;
    float distanceToLine = abs(fract(contour - 0.5) - 0.5);
    float width = max(fwidth(contour), 0.002);
    float line = 1.0 - smoothstep(width * 0.18, width * 0.18 + width, distanceToLine);
    color = mix(color, u_ink, line * 0.38);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export default function Home3DScene({ paused, onReady, onUnavailable }: SceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<SceneControls | null>(null)
  const { resolvedTheme } = useTheme()

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
      u_surface: { value: new THREE.Color() },
      u_ink: { value: new THREE.Color() },
      u_accent: { value: new THREE.Color() },
      u_dark: { value: 0 },
    }
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })
    let compact = mount.clientWidth < 420
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.45, compact ? 24 : 36), material)
    blob.rotation.set(-0.12, 0.2, -0.16)
    scene.add(blob)

    let frame = 0
    let previousTime = 0
    let elapsed = 0
    let running = false
    let isPaused = false
    let intersecting = true
    let lost = false
    let disposed = false
    let ready = false
    const targetPointer = new THREE.Vector2()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')

    const stop = () => {
      running = false
      window.cancelAnimationFrame(frame)
      previousTime = 0
    }
    const fail = () => {
      if (lost || disposed) return
      lost = true
      stop()
      onUnavailable()
    }
    const render = () => {
      if (lost || disposed) return
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
      !isPaused && !reducedMotion.matches && intersecting && !document.hidden && !lost && !disposed
    const tick = (now: number) => {
      if (!canAnimate()) {
        stop()
        return
      }
      const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0
      previousTime = now
      elapsed += delta
      uniforms.u_time.value = elapsed
      uniforms.u_pointer.value.lerp(targetPointer, 1 - Math.exp(-delta * 4))
      blob.rotation.y = 0.2 + Math.sin(elapsed * 0.12) * 0.3 + uniforms.u_pointer.value.x * 0.12
      blob.rotation.x = -0.12 + uniforms.u_pointer.value.y * 0.07
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
      const styles = getComputedStyle(document.documentElement)
      const color = (name: string) =>
        `rgb(${styles.getPropertyValue(name).trim().split(/\s+/).join(',')})`
      uniforms.u_surface.value.setStyle(color('--color-primary'))
      uniforms.u_ink.value.setStyle(color('--color-secondary'))
      uniforms.u_accent.value.setStyle(color('--color-accent'))
      uniforms.u_dark.value = document.documentElement.dataset.theme === 'dark' ? 1 : 0
      // Lift the dark surface so contours remain legible without bloom/postprocessing.
      if (uniforms.u_dark.value) uniforms.u_surface.value.lerp(new THREE.Color('#d5c6bd'), 0.3)
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
        blob.geometry = new THREE.IcosahedronGeometry(1.45, compact ? 24 : 36)
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2))
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
    sync()

    return () => {
      disposed = true
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
    controlsRef.current?.setPaused(paused)
  }, [paused])
  useEffect(() => {
    controlsRef.current?.updateTheme()
  }, [resolvedTheme])

  return (
    <div ref={mountRef} aria-hidden="true" data-testid="blob-canvas" className="absolute inset-0" />
  )
}
