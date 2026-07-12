import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from './scrollState.js'

const FACE_SRC = './photos/face.jpg' // drop your photo here — particles rebuild from it automatically

const VERT = /* glsl */ `
  attribute vec3 aScatter;
  attribute float aShade;
  attribute float aRand;
  uniform float uTime;
  uniform float uProgress;   // 1 = assembled portrait, 0 = scattered dust
  uniform vec2 uPointer;
  varying float vShade;
  varying float vRand;
  varying float vP;

  void main() {
    vShade = aShade;
    vRand = aRand;

    // ease each particle individually for a staggered morph
    float p = clamp(uProgress * 1.4 - aRand * 0.4, 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);
    vP = p;

    vec3 pos = mix(aScatter, position, p);

    // idle breathing (gentler when scattered so it never floods the page)
    pos.x += sin(uTime * 0.6 + aRand * 40.0) * 0.02 * (1.0 + (1.0 - p) * 2.0);
    pos.y += cos(uTime * 0.5 + aRand * 30.0) * 0.02 * (1.0 + (1.0 - p) * 2.0);
    pos.z += sin(uTime * 0.4 + aRand * 20.0) * 0.02;

    // pointer repulsion (in local space, xy plane)
    vec2 toPtr = pos.xy - uPointer * 2.2;
    float d = length(toPtr);
    float force = smoothstep(0.9, 0.0, d) * 0.3 * p;
    pos.xy += normalize(toPtr + 0.0001) * force;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // hard-clamped size so near-camera particles can never become giant blobs
    float size = (1.0 + aShade * 2.2) * (16.0 / max(-mv.z, 1.0));
    gl_PointSize = clamp(size, 1.0, 6.0) * step(0.001, -mv.z);
  }
`

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uInk;
  uniform vec3 uVolt;
  uniform float uFade; // global visibility — 0 once past the hero
  varying float vShade;
  varying float vRand;
  varying float vP;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    if (dot(uv, uv) > 0.25) discard;
    vec3 col = mix(uInk, uVolt, step(0.86, vShade + vRand * 0.06));
    float alpha = (0.12 + vShade * 0.55) * mix(0.35, 1.0, vP) * uFade;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`

/** Fallback shape when no photo exists yet: a faceted diamond / gem lattice. */
function drawPlaceholder(ctx, w, h) {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)
  const cx = w / 2
  const cy = h / 2
  const R = Math.min(w, h) * 0.42

  // outer diamond
  ctx.fillStyle = '#8a8a8a'
  ctx.beginPath()
  ctx.moveTo(cx, cy - R)
  ctx.lineTo(cx + R * 0.72, cy)
  ctx.lineTo(cx, cy + R)
  ctx.lineTo(cx - R * 0.72, cy)
  ctx.closePath()
  ctx.fill()

  // bright crown facet
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.moveTo(cx, cy - R)
  ctx.lineTo(cx + R * 0.72, cy)
  ctx.lineTo(cx, cy - R * 0.1)
  ctx.closePath()
  ctx.fill()

  // mid facet
  ctx.fillStyle = '#c4c4c4'
  ctx.beginPath()
  ctx.moveTo(cx, cy - R)
  ctx.lineTo(cx - R * 0.72, cy)
  ctx.lineTo(cx, cy - R * 0.1)
  ctx.closePath()
  ctx.fill()

  // facet seams
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - R * 0.72, cy)
  ctx.lineTo(cx + R * 0.72, cy)
  ctx.moveTo(cx, cy - R)
  ctx.lineTo(cx, cy + R)
  ctx.stroke()
}

function buildFromCanvas(canvas) {
  const ctx = canvas.getContext('2d')
  const { width: w, height: h } = canvas
  const img = ctx.getImageData(0, 0, w, h).data

  const targets = []
  const scatters = []
  const shades = []
  const rands = []
  const SCALE = 3.4 / h

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4
      const lum = (img[i] * 0.299 + img[i + 1] * 0.587 + img[i + 2] * 0.114) / 255
      if (lum < 0.16) continue // skip dark background
      if (Math.random() > 0.9) continue // thin out slightly

      targets.push((x - w / 2) * SCALE, (h / 2 - y) * SCALE, (lum - 0.5) * 0.35)

      // scatter cloud lives strictly BEHIND the portrait plane (z <= -2),
      // spread wide — never near the camera, so no giant blobs
      scatters.push(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
        -2 - Math.random() * 8
      )
      shades.push(lum)
      rands.push(Math.random())
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(targets, 3))
  geo.setAttribute('aScatter', new THREE.Float32BufferAttribute(scatters, 3))
  geo.setAttribute('aShade', new THREE.Float32BufferAttribute(shades, 1))
  geo.setAttribute('aRand', new THREE.Float32BufferAttribute(rands, 1))
  return geo
}

export default function ParticlePortrait() {
  const mat = useRef()
  const group = useRef()
  const [geometry, setGeometry] = useState(null)
  const { viewport } = useThree()

  useEffect(() => {
    const W = 150
    const H = 180
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // cover-fit the photo into the sampling canvas
      const s = Math.max(W / img.width, H / img.height)
      const dw = img.width * s
      const dh = img.height * s
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh)
      setGeometry(buildFromCanvas(canvas))
    }
    img.onerror = () => {
      drawPlaceholder(ctx, W, H)
      setGeometry(buildFromCanvas(canvas))
    }
    img.src = FACE_SRC

    return () => setGeometry(null)
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uFade: { value: 1 },
      uPointer: { value: new THREE.Vector2() },
      uInk: { value: new THREE.Color('#f2f1ec') },
      uVolt: { value: new THREE.Color('#c8ff2e') }
    }),
    []
  )

  useFrame((state, delta) => {
    if (!mat.current) return
    uniforms.uTime.value += delta

    const sp = scrollState.progress
    // assembled during the hero, dissolves as you leave it…
    const target = 1 - THREE.MathUtils.smoothstep(sp, 0.04, 0.2)
    uniforms.uProgress.value = THREE.MathUtils.lerp(uniforms.uProgress.value, target, 0.05)
    // …then fades out completely so section text stays readable
    const fade = 1 - THREE.MathUtils.smoothstep(sp, 0.18, 0.32)
    uniforms.uFade.value = THREE.MathUtils.lerp(uniforms.uFade.value, fade, 0.08)

    uniforms.uPointer.value.lerp(
      new THREE.Vector2(scrollState.pointer.x, scrollState.pointer.y),
      0.06
    )

    if (group.current) {
      group.current.visible = uniforms.uFade.value > 0.02
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        scrollState.pointer.x * 0.18,
        0.04
      )
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -scrollState.pointer.y * 0.1,
        0.04
      )
    }
  })

  if (!geometry) return null

  const xOffset = viewport.width > 7 ? viewport.width * 0.18 : 0

  return (
    <group ref={group} position={[xOffset, 0.2, 0]}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={mat}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
