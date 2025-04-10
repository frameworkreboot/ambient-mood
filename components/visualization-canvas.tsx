"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { useThree, Canvas } from "@react-three/fiber"
import { Bloom, EffectComposer, Noise } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { MathUtils } from "three"

// Import useAudioEngine at the top of the file
import { useAudioEngine } from "@/hooks/use-audio-engine"

// Add a new BeatDetector component to handle beat reactivity
function BeatDetector({ onBeat, isPlaying }) {
  const { registerBeatCallback, getBeatAnalyzerData } = useAudioEngine()
  const beatRef = useRef({
    isBeat: false,
    energy: 0,
    decay: 0.98,
    lastBeatTime: 0,
  })

  // Register for beat callbacks from the audio engine
  useEffect(() => {
    if (!isPlaying) return

    const unregister = registerBeatCallback((time, velocity) => {
      beatRef.current.isBeat = true
      beatRef.current.energy = Math.min(1, beatRef.current.energy + velocity * 0.5)
      beatRef.current.lastBeatTime = time
    })

    return unregister
  }, [registerBeatCallback, isPlaying])

  // Update beat energy on each frame
  useFrame(() => {
    if (beatRef.current.isBeat) {
      onBeat(beatRef.current.energy)
      beatRef.current.isBeat = false
    } else {
      // Decay energy over time
      beatRef.current.energy *= beatRef.current.decay

      // Try to detect beats from analyzer data
      const beatData = getBeatAnalyzerData()
      if (beatData) {
        // Simple beat detection algorithm
        let sum = 0
        for (let i = 0; i < beatData.length; i++) {
          sum += Math.abs(beatData[i])
        }
        const average = sum / beatData.length

        // If average is above threshold, consider it a beat
        if (average > 0.5 && beatRef.current.energy < 0.5) {
          beatRef.current.energy = Math.min(1, beatRef.current.energy + average)
          onBeat(beatRef.current.energy)
        }
      }
    }
  })

  return null
}

// Update the GridShaderMaterial to be beat-reactive
const GridShaderMaterial = ({ color, accentColor, intensity, value, mood, beatEnergy = 0 }) => {
  const materialRef = useRef()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uAccentColor: { value: new THREE.Color(accentColor) },
      uIntensity: { value: intensity || 0.5 },
      uValue: { value: value || 50 },
      uMood: { value: mood || 0 },
      uBeatEnergy: { value: beatEnergy || 0 },
    }),
    [color, accentColor, intensity, value, mood, beatEnergy],
  )

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uColor.value = new THREE.Color(color)
      materialRef.current.uniforms.uAccentColor.value = new THREE.Color(accentColor)
      materialRef.current.uniforms.uIntensity.value = intensity || 0.5
      materialRef.current.uniforms.uValue.value = value || 50
      materialRef.current.uniforms.uMood.value = mood || 0
      materialRef.current.uniforms.uBeatEnergy.value = beatEnergy || 0
    }
  })

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      vertexShader={`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uAccentColor;
        uniform float uIntensity;
        uniform float uValue;
        uniform float uMood;
        uniform float uBeatEnergy;
        varying vec2 vUv;

        // Function to create a grid pattern
        float grid(vec2 uv, float size) {
          vec2 grid = fract(uv * size);
          return step(0.02 + (uIntensity * 0.03), grid.x) * step(0.02 + (uIntensity * 0.03), grid.y);
        }

        void main() {
          // Create a moving grid effect
          vec2 uv = vUv;
          
          // Add beat-reactive distortion
          float beatDistortion = uBeatEnergy * 0.2;
          
          // Distort UVs based on time, mood and beat
          float distortionAmount = 0.1 + (uIntensity * 0.2) + beatDistortion;
          float distortionSpeed = 0.2 + (abs(uMood) * 0.1);
          float moodFactor = uMood * 0.05;
          
          uv.x += sin(uv.y * 10.0 + uTime * distortionSpeed) * distortionAmount * moodFactor;
          uv.y += cos(uv.x * 10.0 + uTime * distortionSpeed) * distortionAmount * moodFactor;
          
          // Create multiple grid layers with different sizes and movement
          float gridSize1 = 20.0 + (uValue * 0.5);
          float gridSize2 = 40.0 + (uValue * 0.3);
          
          vec2 offset1 = vec2(sin(uTime * 0.2) * 0.1, cos(uTime * 0.3) * 0.1) * uIntensity;
          vec2 offset2 = vec2(cos(uTime * 0.3) * 0.2, sin(uTime * 0.2) * 0.2) * uIntensity;
          
          // Add beat-reactive grid movement
          offset1 += vec2(sin(uTime) * uBeatEnergy * 0.2, cos(uTime) * uBeatEnergy * 0.2);
          
          float g1 = grid(uv + offset1, gridSize1);
          float g2 = grid(uv + offset2, gridSize2);
          
          // Combine grids
          float g = g1 * g2;
          
          // Create color gradient based on position and time
          vec3 gradientColor = mix(uColor, uAccentColor, 
            sin(uv.x * 3.14 + uTime * 0.2) * 0.5 + 0.5);
          
          // Apply grid pattern
          vec3 finalColor = mix(gradientColor, vec3(1.0), g * 0.3);
          
          // Add pulsing effect based on intensity and beat
          float pulse = sin(uTime * (1.0 + uIntensity)) * 0.5 + 0.5;
          finalColor *= 0.8 + (pulse * uIntensity * 0.4) + (uBeatEnergy * 0.3);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `}
    />
  )
}

// Update ParticleField to be beat-reactive
function ParticleField({ color, accentColor, intensity, value, mood, beatEnergy = 0 }) {
  const pointsRef = useRef()
  const [positions, setPositions] = useState([])
  const [sizes, setSizes] = useState([])
  const originalPositionsRef = useRef([])

  // Generate particles
  useEffect(() => {
    const particleCount = 2000
    const newPositions = []
    const newSizes = []

    for (let i = 0; i < particleCount; i++) {
      // Create particles in a spherical distribution
      const radius = 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      newPositions.push(x, y, z)

      // Vary particle size based on distance from center
      const distance = Math.sqrt(x * x + y * y + z * z)
      const size = MathUtils.mapLinear(distance, 0, radius, 0.1, 0.5)
      newSizes.push(size)
    }

    setPositions(newPositions)
    setSizes(newSizes)
    originalPositionsRef.current = [...newPositions]
  }, [])

  // Animate particles
  useFrame((state) => {
    if (!pointsRef.current || positions.length === 0) return

    const time = state.clock.getElapsedTime()
    const positionArray = pointsRef.current.geometry.attributes.position.array
    const originalPositions = originalPositionsRef.current

    // Animate particles based on emotion data and beat
    const speedFactor = 0.1 + intensity * 0.2
    const radiusFactor = 1 + value / 200
    const turbulenceFactor = 0.5 + Math.abs(mood) / 10

    // Add beat-reactive expansion
    const beatExpansion = 1 + beatEnergy * 0.5

    for (let i = 0; i < positionArray.length; i += 3) {
      const i3 = i / 3

      // Get original position
      const x = originalPositions[i]
      const y = originalPositions[i + 1]
      const z = originalPositions[i + 2]

      // Apply turbulence based on mood
      const turbulence = Math.sin(i3 + time * speedFactor) * turbulenceFactor

      // Scale position with beat energy
      const scale = radiusFactor * beatExpansion + Math.sin(time * 0.2) * 0.1

      // Update position with turbulence
      positionArray[i] = x * scale + turbulence * 0.1
      positionArray[i + 1] = y * scale + turbulence * 0.1
      positionArray[i + 2] = z * scale + turbulence * 0.1
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  if (positions.length === 0) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={new Float32Array(positions)}
          itemSize={3}
        />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={new Float32Array(sizes)} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.2} sizeAttenuation transparent color={accentColor} blending={THREE.AdditiveBlending} />
    </points>
  )
}

// Update WireframeSphere to be beat-reactive
function WireframeSphere({ color, accentColor, intensity, value, mood, beatEnergy = 0 }) {
  const meshRef = useRef()

  useFrame((state) => {
    if (!meshRef.current) return

    const time = state.clock.getElapsedTime()

    // Rotate based on mood (positive mood = clockwise, negative = counter-clockwise)
    const rotationSpeed = 0.1 + intensity * 0.2
    const rotationDirection = mood >= 0 ? 1 : -1

    meshRef.current.rotation.y += rotationSpeed * 0.01 * rotationDirection
    meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.2

    // Scale based on value and beat energy
    const scale = (1 + value / 200) * (1 + beatEnergy * 0.3)
    meshRef.current.scale.set(scale, scale, scale)
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 24, 24]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.6} />
    </mesh>
  )
}

// Update Scene component to handle beat reactivity
function Scene({ data, bgColor, accentColor, isPlaying }) {
  const { camera } = useThree()
  const [beatEnergy, setBeatEnergy] = useState(0)

  useEffect(() => {
    camera.position.z = 10
  }, [camera])

  // Extract emotion data
  const intensity = data?.intensity || 0.5
  const value = data?.value || 50
  const mood = data?.mood || 0

  // Handle beat detection
  const handleBeat = (energy) => {
    setBeatEnergy(energy)
  }

  return (
    <>
      {/* Beat detector component */}
      <BeatDetector onBeat={handleBeat} isPlaying={isPlaying} />

      {/* Background plane with shader */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[20, 20]} />
        <GridShaderMaterial
          color={bgColor}
          accentColor={accentColor}
          intensity={intensity}
          value={value}
          mood={mood}
          beatEnergy={beatEnergy}
        />
      </mesh>

      {/* Particle system */}
      <ParticleField
        color={bgColor}
        accentColor={accentColor}
        intensity={intensity}
        value={value}
        mood={mood}
        beatEnergy={beatEnergy}
      />

      {/* Wireframe sphere */}
      <WireframeSphere
        color={accentColor}
        accentColor={bgColor}
        intensity={intensity}
        value={value}
        mood={mood}
        beatEnergy={beatEnergy}
      />

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom intensity={0.5 + intensity * 0.5 + beatEnergy * 0.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
        <Noise opacity={0.1 + Math.abs(mood) / 50} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </>
  )
}

export function VisualizationCanvas({ data, bgColor, accentColor, isPlaying }) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <Scene data={data} bgColor={bgColor} accentColor={accentColor} isPlaying={isPlaying} />
      </Canvas>
    </div>
  )
}
