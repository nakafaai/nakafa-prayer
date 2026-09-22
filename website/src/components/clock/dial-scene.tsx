import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { MathUtils, Object3D, type Group, type InstancedMesh } from 'three'
import { HOUR_MARK_COUNT, isMajorHourMark, type DialView } from './dial-view'

/** Material colours, taken from the Nakafa tokens as hex for the WebGL pipeline. */
export type DialPalette = {
  face: string
  platform: string
  edge: string
  tick: string
  lit: string
  marker: string
  hand: string
  fill: string
  rim: string
}

const PALETTE: Record<'light' | 'dark', DialPalette> = {
  light: {
    face: '#d5deea',
    platform: '#f6f9fd',
    edge: '#aebccd',
    tick: '#93a2b6',
    lit: '#15294f',
    marker: '#6d7c90',
    hand: '#15294f',
    fill: '#cfe0ff',
    rim: '#ffffff',
  },
  dark: {
    face: '#0b1729',
    platform: '#152540',
    edge: '#2c3f59',
    tick: '#33475f',
    lit: '#39c7f4',
    marker: '#4a5f7d',
    hand: '#39c7f4',
    fill: '#2a6fa8',
    rim: '#8fd8f5',
  },
}

/** Geometry constants, in dial radii. */
const BODY_RADIUS = 1
const BODY_TOP = 0.04
const TICK_RADIUS = 0.95
const MARKER_RADIUS = 0.82
const PLATFORM_RADIUS = 0.7
const PLATFORM_TOP = 0.058
const HAND_TOP = 0.068

/** Reused every frame so the render loop allocates nothing. */
const scratch = new Object3D()

export type MotionMode = 'damped' | 'instant'

type SceneProps = {
  view: DialView
  theme: 'light' | 'dark'
  motion: MotionMode
}

/** Radius and angle of a day fraction on the horizontal dial. */
function placeOnDial(fraction: number, radius: number, height: number): [number, number, number] {
  const angle = fraction * Math.PI * 2
  return [Math.sin(angle) * radius, height, -Math.cos(angle) * radius]
}

function HourMarks({
  litTicks,
  color,
  showRemaining,
}: {
  litTicks: number
  color: string
  /** True when this ring draws the ticks that have not passed yet. */
  showRemaining: boolean
}) {
  const mesh = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const ring = mesh.current
    if (!ring) return

    for (let index = 0; index < HOUR_MARK_COUNT; index += 1) {
      const passed = index < litTicks
      const visible = showRemaining ? !passed : passed
      const fraction = index / HOUR_MARK_COUNT

      scratch.position.set(...placeOnDial(fraction, TICK_RADIUS, BODY_TOP + 0.005))
      scratch.rotation.set(0, -fraction * Math.PI * 2, 0)
      // A hidden mark collapses to nothing; a major mark reaches further in.
      scratch.scale.set(1, 1, visible ? (isMajorHourMark(index) ? 1.5 : 1) : 0)
      scratch.updateMatrix()
      ring.setMatrixAt(index, scratch.matrix)
    }

    ring.instanceMatrix.needsUpdate = true
  }, [litTicks, showRemaining])

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, HOUR_MARK_COUNT]}>
      <boxGeometry args={[0.018, 0.016, 0.06]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
    </instancedMesh>
  )
}

function PrayerMarkers({ view, palette }: { view: DialView; palette: DialPalette }) {
  return (
    <>
      {view.markers.map((marker, index) => {
        const isNext = index === view.nextIndex

        return (
          <mesh
            key={marker.id}
            position={placeOnDial(marker.fraction, MARKER_RADIUS, BODY_TOP + 0.008)}
            rotation={[0, -marker.fraction * Math.PI * 2, 0]}
            castShadow
          >
            <boxGeometry args={[0.036, 0.022, isNext ? 0.17 : 0.12]} />
            <meshStandardMaterial
              color={isNext ? palette.lit : palette.marker}
              roughness={0.35}
              metalness={0.15}
              emissive={isNext ? palette.lit : palette.marker}
              emissiveIntensity={isNext ? 0.45 : 0}
            />
          </mesh>
        )
      })}
    </>
  )
}

function SweepingHand({
  angle,
  motion,
  palette,
}: {
  angle: number
  motion: MotionMode
  palette: DialPalette
}) {
  const group = useRef<Group>(null)
  const started = useRef(false)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    invalidate()
  }, [angle, invalidate])

  useFrame((_, delta) => {
    const hand = group.current
    if (!hand) return

    if (!started.current || motion === 'instant') {
      hand.rotation.y = angle
      started.current = true
      return
    }

    // Damping runs from the current on-screen value, so a new target simply
    // redirects the sweep instead of restarting it.
    const next = MathUtils.damp(hand.rotation.y, angle, 6, Math.min(delta, 0.1))
    const settled = Math.abs(next - angle) < 0.0002
    hand.rotation.y = settled ? angle : next

    if (!settled) {
      invalidate()
    }
  })

  return (
    <group ref={group}>
      <mesh position={[0, HAND_TOP, -0.33]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.007, 0.022, 0.66, 4]} />
        <meshStandardMaterial color={palette.hand} roughness={0.28} metalness={0.2} />
      </mesh>
      <mesh position={[0, HAND_TOP, 0]} castShadow>
        <cylinderGeometry args={[0.052, 0.052, 0.028, 48]} />
        <meshStandardMaterial color={palette.edge} roughness={0.4} metalness={0.25} />
      </mesh>
    </group>
  )
}

/** Aims the default camera at the dial centre. */
function CameraRig({
  position,
  target,
}: {
  position: [number, number, number]
  target: [number, number, number]
}) {
  const camera = useThree((state) => state.camera)

  useLayoutEffect(() => {
    camera.position.set(...position)
    camera.lookAt(...target)
    camera.updateProjectionMatrix()
  }, [camera, position, target])

  useFrame(() => camera.lookAt(...target))

  return null
}

/** Tilts the dial a few degrees towards the pointer. Decorative, so it stays subtle. */
function PointerParallax({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const group = useRef<Group>(null)
  const target = useRef({ x: 0, y: 0 })
  const invalidate = useThree((state) => state.invalidate)
  const domElement = useThree((state) => state.gl.domElement)

  useEffect(() => {
    if (!enabled) return

    const onMove = (event: PointerEvent) => {
      const rect = domElement.getBoundingClientRect()
      target.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
      }
      invalidate()
    }
    const onLeave = () => {
      target.current = { x: 0, y: 0 }
      invalidate()
    }

    domElement.addEventListener('pointermove', onMove)
    domElement.addEventListener('pointerleave', onLeave)

    return () => {
      domElement.removeEventListener('pointermove', onMove)
      domElement.removeEventListener('pointerleave', onLeave)
    }
  }, [domElement, enabled, invalidate])

  useFrame((_, delta) => {
    const tilt = group.current
    if (!tilt) return

    const step = Math.min(delta, 0.1)
    const nextX = MathUtils.damp(tilt.rotation.x, -target.current.y * 0.06, 5, step)
    const nextZ = MathUtils.damp(tilt.rotation.z, target.current.x * 0.08, 5, step)
    const settled =
      Math.abs(nextX - tilt.rotation.x) < 0.0001 && Math.abs(nextZ - tilt.rotation.z) < 0.0001

    tilt.rotation.x = nextX
    tilt.rotation.z = nextZ

    if (!settled) {
      invalidate()
    }
  })

  return <group ref={group}>{children}</group>
}

function DialBody({ palette }: { palette: DialPalette }) {
  return (
    <>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS, BODY_TOP * 2, 128]} />
        <meshStandardMaterial color={palette.face} roughness={0.46} metalness={0.1} />
      </mesh>

      {/* A raised inner platform gives the face a second plane to catch light. */}
      <mesh position={[0, PLATFORM_TOP, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[PLATFORM_RADIUS, 128]} />
        <meshStandardMaterial color={palette.platform} roughness={0.62} metalness={0.02} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[BODY_RADIUS, 0.032, 16, 128]} />
        <meshStandardMaterial color={palette.edge} roughness={0.3} metalness={0.4} />
      </mesh>
    </>
  )
}

function Scene({ view, theme, motion }: SceneProps) {
  const palette = PALETTE[theme]
  const litTicks = Math.min(HOUR_MARK_COUNT, Math.floor(view.fraction * HOUR_MARK_COUNT) + 1)
  const handAngle = -(view.dayIndex + view.fraction) * Math.PI * 2

  return (
    <>
      {/*
       * Framing is deliberate: a tilted disc is widest horizontally, and the
       * canvas is square, so the camera distance is set by the dial's diameter
       * plus its shadow. Closer than this clips the rim at the left and right.
       */}
      <CameraRig position={[0, 4.5, 2.6]} target={[0, -0.06, 0]} />

      <hemisphereLight args={[palette.rim, palette.fill, 0.5]} />
      <directionalLight
        position={[1.9, 4.6, 1.2]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-1.6}
        shadow-camera-right={1.6}
        shadow-camera-top={1.6}
        shadow-camera-bottom={-1.6}
        shadow-camera-near={2}
        shadow-camera-far={9}
        shadow-normalBias={0.015}
      />
      <directionalLight position={[-3, 1.4, 2]} intensity={0.35} color={palette.fill} />
      <directionalLight position={[0.8, 1.2, -3.2]} intensity={0.45} color={palette.rim} />

      <PointerParallax enabled={motion === 'damped'}>
        <DialBody palette={palette} />
        <HourMarks litTicks={litTicks} color={palette.tick} showRemaining />
        <HourMarks litTicks={litTicks} color={palette.lit} showRemaining={false} />
        <PrayerMarkers view={view} palette={palette} />
        <SweepingHand angle={handAngle} motion={motion} palette={palette} />
      </PointerParallax>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.16, 0]} receiveShadow>
        <planeGeometry args={[3.4, 3.4]} />
        <shadowMaterial transparent opacity={theme === 'dark' ? 0.45 : 0.22} />
      </mesh>
    </>
  )
}

/**
 * The 3D dial.
 *
 * Loaded lazily so Three.js never blocks the first paint, and rendered on
 * demand so a resting dial costs nothing.
 */
export default function DialScene(props: SceneProps) {
  return (
    <Canvas
      flat
      shadows="percentage"
      dpr={[1, 2]}
      frameloop="demand"
      camera={{ fov: 28 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene {...props} />
    </Canvas>
  )
}
