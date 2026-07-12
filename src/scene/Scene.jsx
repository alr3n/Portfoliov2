import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import ParticlePortrait from './ParticlePortrait.jsx'
import { scrollState } from './scrollState.js'

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

export default function Scene() {
  return (
    <div className="webgl-layer" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: isMobile ? 58 : 50 }}
        dpr={isMobile ? [1, 1.3] : [1, 1.8]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
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
