import { Component, Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import ParticlePortrait from './ParticlePortrait.jsx'
import { scrollState } from './scrollState.js'

/** The 3D scene is purely decorative (aria-hidden). If WebGL init or a
 * Three.js render throws — common on memory-constrained mobile WebViews
 * like in-app browsers — this stops it from taking the rest of the page
 * (nav, sections, footer) down with it. */
class SceneErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    console.error('3D scene failed, continuing without it:', error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const isMobile = typeof window !== 'undefined' && window.innerWidth <= 860

/** Slow-drifting dust field for depth. */
function Dust({ count = isMobile ? 160 : 350 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
    }
    return arr
  }, [count])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.012
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#5a5a55" transparent opacity={0.55} depthWrite={false} />
    </points>
  )
}

/** Wireframe grid floor that races past as you scroll — a nod to the circuit. */
function GridFloor() {
  const ref = useRef()
  useFrame(() => {
    if (!ref.current) return
    ref.current.position.z = -4 + (scrollState.progress * 14) % 2
    ref.current.material.opacity = 0.05 + scrollState.progress * 0.1
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, -4]}>
      <planeGeometry args={[60, 60, 48, 48]} />
      <meshBasicMaterial color="#c8ff2e" wireframe transparent opacity={0.06} />
    </mesh>
  )
}

function CameraRig() {
  useFrame(({ camera }) => {
    const p = scrollState.progress
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5 + p * 3.5, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -p * 1.2, 0.05)
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, scrollState.pointer.x * 0.3, 0.04)
    camera.lookAt(0, 0, 0)
  })
  return null
}

function SceneCanvas() {
  return (
    <div className="webgl-layer" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: isMobile ? 58 : 50 }}
        dpr={isMobile ? [1, 1.3] : [1, 1.8]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          // A lost GPU context (common under memory pressure in constrained
          // mobile WebViews) doesn't throw a catchable JS error by default —
          // it silently freezes the canvas. preventDefault() lets the
          // browser attempt to restore it instead of abandoning it outright.
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            console.warn('WebGL context lost — page keeps working, scene will attempt to recover.')
          })
        }}
      >
        <Suspense fallback={null}>
          <ParticlePortrait />
        </Suspense>
        <Dust />
        <GridFloor />
        <CameraRig />
      </Canvas>
    </div>
  )
}

export default function Scene() {
  return (
    <SceneErrorBoundary>
      <SceneCanvas />
    </SceneErrorBoundary>
  )
}
