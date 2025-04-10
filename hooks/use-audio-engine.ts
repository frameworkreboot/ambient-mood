"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as Tone from "tone"

type OscillatorType = "sine" | "square" | "sawtooth" | "triangle"
type FilterType = "lowpass" | "highpass" | "bandpass" | "notch"

type SoundParams = {
  frequency: number
  modulation: number
  resonance: number
  oscillatorEnabled?: boolean
  oscillatorType?: OscillatorType
  filterType?: FilterType
  filterFrequency?: number
  reverbDecay?: number
  reverbWet?: number
  attack?: number
  release?: number
  harmonicity?: number
  drumPattern?: string
  tempo?: number
  drumVolume?: number
  drumFilter?: number
}

export function useAudioEngine() {
  const synthRef = useRef<Tone.PolySynth | null>(null)
  const modulatorRef = useRef<Tone.Synth | null>(null)
  const filterRef = useRef<Tone.Filter | null>(null)
  const reverbRef = useRef<Tone.Reverb | null>(null)
  const volumeRef = useRef<Tone.Volume | null>(null)
  const analyzerRef = useRef<Tone.Analyser | null>(null)
  const beatAnalyzerRef = useRef<Tone.Analyser | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Use synthesizers for drums instead of samples
  const kickSynthRef = useRef<Tone.MembraneSynth | null>(null)
  const snareSynthRef = useRef<Tone.NoiseSynth | null>(null)
  const hihatSynthRef = useRef<Tone.MetalSynth | null>(null)
  const drumBusRef = useRef<Tone.Channel | null>(null)
  const drumFilterRef = useRef<Tone.Filter | null>(null)
  const sequencerRef = useRef<Tone.Sequence | null>(null)
  const beatCallbacksRef = useRef<Array<(time: number, velocity: number) => void>>([])

  const [isInitialized, setIsInitialized] = useState(false)
  const [audioParams, setAudioParams] = useState<Omit<SoundParams, "frequency" | "modulation" | "resonance">>({
    oscillatorEnabled: true,
    oscillatorType: "sine",
    filterType: "lowpass",
    filterFrequency: 1000,
    reverbDecay: 5,
    reverbWet: 0.5,
    attack: 0.5,
    release: 2,
    harmonicity: 1.5,
    drumPattern: "none",
    tempo: 110,
    drumVolume: 0.5,
    drumFilter: 1000,
  })

  // Add a function to register beat callbacks for visualization
  const registerBeatCallback = useCallback((callback: (time: number, velocity: number) => void) => {
    beatCallbacksRef.current.push(callback)
    return () => {
      beatCallbacksRef.current = beatCallbacksRef.current.filter((cb) => cb !== callback)
    }
  }, [])

  // Add a function to trigger beat callbacks
  const triggerBeat = useCallback((time: number, velocity = 1) => {
    beatCallbacksRef.current.forEach((callback) => callback(time, velocity))
  }, [])

  useEffect(() => {
    // Initialize Tone.js
    if (typeof window !== "undefined") {
      // Set the BPM
      Tone.Transport.bpm.value = audioParams.tempo || 110

      // Create audio components
      if (!synthRef.current) {
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: audioParams.oscillatorType,
          },
          envelope: {
            attack: audioParams.attack,
            decay: 0.1,
            sustain: 1,
            release: audioParams.release,
          },
        })
      }

      if (!modulatorRef.current) {
        modulatorRef.current = new Tone.Synth({
          oscillator: {
            type: "sine",
          },
          envelope: {
            attack: 0.5,
            decay: 0.1,
            sustain: 1,
            release: 1,
          },
        })
      }

      if (!filterRef.current) {
        filterRef.current = new Tone.Filter({
          type: audioParams.filterType,
          frequency: audioParams.filterFrequency,
          Q: 1,
        })
      }

      if (!reverbRef.current) {
        reverbRef.current = new Tone.Reverb({
          decay: audioParams.reverbDecay,
          wet: audioParams.reverbWet,
        })
      }

      if (!volumeRef.current) {
        volumeRef.current = new Tone.Volume(-10)
      }

      if (!analyzerRef.current) {
        analyzerRef.current = new Tone.Analyser("waveform", 1024)
      }

      if (!beatAnalyzerRef.current) {
        beatAnalyzerRef.current = new Tone.Analyser("waveform", 128)
      }

      // Initialize drum components
      if (!drumBusRef.current) {
        drumBusRef.current = new Tone.Channel({
          volume: audioParams.drumVolume !== undefined ? Tone.gainToDb(audioParams.drumVolume) : -6,
          pan: 0,
        }).toDestination()
      }

      if (!drumFilterRef.current) {
        drumFilterRef.current = new Tone.Filter({
          type: "lowpass",
          frequency: audioParams.drumFilter || 1000,
          Q: 1,
        }).connect(drumBusRef.current)
      }

      // Create synthesizers for drums
      if (!kickSynthRef.current) {
        kickSynthRef.current = new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 5,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.001,
            decay: 0.4,
            sustain: 0.01,
            release: 1.4,
          },
        }).connect(drumFilterRef.current)
      }

      if (!snareSynthRef.current) {
        snareSynthRef.current = new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: {
            attack: 0.001,
            decay: 0.2,
            sustain: 0,
            release: 0.2,
          },
        }).connect(drumFilterRef.current)
      }

      if (!hihatSynthRef.current) {
        hihatSynthRef.current = new Tone.MetalSynth({
          envelope: {
            attack: 0.001,
            decay: 0.1,
            release: 0.01,
          },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5,
        }).connect(drumFilterRef.current)
        hihatSynthRef.current.volume.value = -20
        hihatSynthRef.current.frequency.value = 200
      }

      // Connect kick to beat analyzer for visualization
      kickSynthRef.current?.connect(beatAnalyzerRef.current)

      // Connect the audio chain
      synthRef.current?.connect(filterRef.current)
      filterRef.current?.connect(reverbRef.current)
      reverbRef.current?.connect(volumeRef.current)
      volumeRef.current?.connect(analyzerRef.current)
      analyzerRef.current?.toDestination()

      // Modulator setup
      modulatorRef.current?.connect(filterRef.current.frequency)

      setIsInitialized(true)
    }

    return () => {
      // Clean up audio resources
      stopSound()
      
      // Wait a brief moment before disposing to ensure all notes are released
      setTimeout(() => {
        if (synthRef.current) {
          synthRef.current.dispose()
          synthRef.current = null
        }
        if (modulatorRef.current) {
          modulatorRef.current.dispose()
          modulatorRef.current = null
        }
        if (filterRef.current) {
          filterRef.current.dispose()
          filterRef.current = null
        }
        if (reverbRef.current) {
          reverbRef.current.dispose()
          reverbRef.current = null
        }
        if (volumeRef.current) {
          volumeRef.current.dispose()
          volumeRef.current = null
        }
        if (analyzerRef.current) {
          analyzerRef.current.dispose()
          analyzerRef.current = null
        }
        if (beatAnalyzerRef.current) {
          beatAnalyzerRef.current.dispose()
          beatAnalyzerRef.current = null
        }
        if (kickSynthRef.current) {
          kickSynthRef.current.dispose()
          kickSynthRef.current = null
        }
        if (snareSynthRef.current) {
          snareSynthRef.current.dispose()
          snareSynthRef.current = null
        }
        if (hihatSynthRef.current) {
          hihatSynthRef.current.dispose()
          hihatSynthRef.current = null
        }
        if (drumBusRef.current) {
          drumBusRef.current.dispose()
          drumBusRef.current = null
        }
        if (drumFilterRef.current) {
          drumFilterRef.current.dispose()
          drumFilterRef.current = null
        }
        if (sequencerRef.current) {
          sequencerRef.current.dispose()
          sequencerRef.current = null
        }
      }, 100)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Stop transport
      Tone.Transport.stop()
    }
  }, [])

  // Update audio parameters when they change
  useEffect(() => {
    if (!isInitialized) return

    if (synthRef.current) {
      synthRef.current.set({
        oscillator: {
          type: audioParams.oscillatorType,
        },
        envelope: {
          attack: audioParams.attack,
          release: audioParams.release,
        },
      })
    }

    if (filterRef.current && audioParams.filterType) {
      filterRef.current.type = audioParams.filterType
      filterRef.current.frequency.value = audioParams.filterFrequency || 1000
    }

    if (reverbRef.current) {
      // Reverb needs to be recreated to change decay time
      reverbRef.current.dispose()
      reverbRef.current = new Tone.Reverb({
        decay: audioParams.reverbDecay,
        wet: audioParams.reverbWet,
      }).toDestination()

      if (filterRef.current && volumeRef.current) {
        filterRef.current.disconnect()
        filterRef.current.connect(reverbRef.current)
        reverbRef.current.connect(volumeRef.current)
      }
    }

    // Update drum parameters
    if (drumBusRef.current && audioParams.drumVolume !== undefined) {
      drumBusRef.current.volume.value = Tone.gainToDb(audioParams.drumVolume)
    }

    if (drumFilterRef.current && audioParams.drumFilter !== undefined) {
      drumFilterRef.current.frequency.value = audioParams.drumFilter
    }

    // Update tempo
    if (audioParams.tempo) {
      Tone.Transport.bpm.value = audioParams.tempo
    }

    // Update drum pattern
    updateDrumPattern(audioParams.drumPattern || "none")
  }, [audioParams, isInitialized])

  // Function to update drum pattern
  const updateDrumPattern = (pattern: string) => {
    if (!isInitialized) return

    // Stop current sequence if it exists
    if (sequencerRef.current) {
      sequencerRef.current.stop()
      sequencerRef.current.dispose()
      sequencerRef.current = null
    }

    if (pattern === "none") {
      Tone.Transport.stop()
      return
    }

    // Define patterns
    let kickPattern: (null | number)[] = []
    let snarePattern: (null | number)[] = []
    let hihatPattern: (null | number)[] = []

    switch (pattern) {
      case "four-on-floor":
        kickPattern = [1, null, null, null, 1, null, null, null, 1, null, null, null, 1, null, null, null]
        snarePattern = [null, null, 1, null, null, null, 1, null, null, null, 1, null, null, null, 1, null]
        hihatPattern = [null, 1, null, 1, null, 1, null, 1, null, 1, null, 1, null, 1, null, 1]
        break
      case "dub":
        kickPattern = [1, null, null, null, null, null, 1, null, null, null, 1, null, null, null, null, null]
        snarePattern = [null, null, null, null, 1, null, null, null, null, null, null, null, 1, null, null, null]
        hihatPattern = [null, 1, null, 1, null, 1, null, 1, null, 1, null, 1, null, 1, null, 1]
        break
      case "breakbeat":
        kickPattern = [1, null, null, null, null, null, null, 1, null, null, 1, null, null, null, null, null]
        snarePattern = [null, null, null, 1, null, null, 1, null, null, null, null, 1, null, null, 1, null]
        hihatPattern = [1, null, 1, null, 1, null, 1, null, 1, null, 1, null, 1, null, 1, null]
        break
      case "ambient":
        kickPattern = [1, null, null, null, null, null, null, null, 1, null, null, null, null, null, null, null]
        snarePattern = [null, null, null, null, 1, null, null, null, null, null, null, null, 1, null, null, null]
        hihatPattern = [null, null, 1, null, null, null, 1, null, null, null, 1, null, null, null, 1, null]
        break
      default:
        return
    }

    // Create sequence
    sequencerRef.current = new Tone.Sequence(
      (time, step) => {
        const index = step % 16

        if (kickPattern[index] && kickSynthRef.current) {
          kickSynthRef.current.triggerAttackRelease("C1", "8n", time)
          triggerBeat(time, kickPattern[index] || 0.5)
        }

        if (snarePattern[index] && snareSynthRef.current) {
          snareSynthRef.current.triggerAttackRelease("8n", time)
        }

        if (hihatPattern[index] && hihatSynthRef.current) {
          hihatSynthRef.current.triggerAttackRelease("32n", time)
        }
      },
      Array.from({ length: 16 }, (_, i) => i),
      "16n",
    )

    // Start sequence
    sequencerRef.current.start(0)

    // Start transport if not already started
    if (Tone.Transport.state !== "started") {
      Tone.Transport.start()
    }
  }

  const initializeAudio = async () => {
    if (!isInitialized) {
      await Tone.start()
      setIsInitialized(true)
    }
  }

  const playSound = async (params: SoundParams) => {
    await initializeAudio()

    if (!synthRef.current || !modulatorRef.current || !filterRef.current) return

    // Stop any currently playing sounds
    stopSound()

    // Set parameters based on emotion data
    const baseFreq = params.frequency
    const modFreq = params.modulation
    const filterQ = Math.max(0.1, Math.min(10, params.resonance + 5))

    // Update filter
    filterRef.current.Q.value = filterQ
    filterRef.current.frequency.value = params.filterFrequency || baseFreq * 2

    // Only start oscillator if enabled
    if (params.oscillatorEnabled !== false) {
      // Start modulator
      modulatorRef.current.frequency.value = modFreq
      modulatorRef.current.volume.value = -20
      modulatorRef.current.triggerAttack(modFreq)

      // Play a chord based on the base frequency
      const harmonicity = params.harmonicity || 1.5
      const chord = [
        baseFreq,
        baseFreq * harmonicity, // Adjustable harmonic interval
        baseFreq * 1.5, // Perfect fifth
      ]

      synthRef.current.triggerAttack(chord)
    }

    // Start waveform visualization
    if (analyzerRef.current) {
      const canvas = document.getElementById("waveform") as HTMLCanvasElement
      if (canvas) {
        canvasRef.current = canvas
        const drawWaveform = () => {
          if (!analyzerRef.current || !canvasRef.current) return

          const ctx = canvasRef.current.getContext("2d")
          if (!ctx) return

          // Set canvas dimensions to match display size
          if (
            canvasRef.current.width !== canvasRef.current.clientWidth ||
            canvasRef.current.height !== canvasRef.current.clientHeight
          ) {
            canvasRef.current.width = canvasRef.current.clientWidth
            canvasRef.current.height = canvasRef.current.clientHeight
          }

          const width = canvasRef.current.width
          const height = canvasRef.current.height
          const waveform = analyzerRef.current.getValue() as Float32Array

          // Clear canvas
          ctx.clearRect(0, 0, width, height)

          // Draw waveform
          ctx.beginPath()
          ctx.strokeStyle = "#6366f1" // Indigo color
          ctx.lineWidth = 2

          const sliceWidth = width / waveform.length
          let x = 0

          for (let i = 0; i < waveform.length; i++) {
            const v = waveform[i]
            const y = (v * 0.5 + 0.5) * height

            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }

            x += sliceWidth
          }

          ctx.stroke()
          animationFrameRef.current = requestAnimationFrame(drawWaveform)
        }

        drawWaveform()
      }
    }

    // Start drum pattern if selected
    if (params.drumPattern && params.drumPattern !== "none") {
      updateDrumPattern(params.drumPattern)
    }
  }

  const stopSound = () => {
    if (synthRef.current) {
      synthRef.current.releaseAll()
    }
    if (modulatorRef.current) {
      modulatorRef.current.triggerRelease()
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Stop drum sequence
    if (sequencerRef.current) {
      sequencerRef.current.stop()
    }
    
    // Stop transport
    Tone.Transport.stop()
  }

  const setAudioVolume = (level: number) => {
    if (volumeRef.current) {
      // Convert 0-1 to decibels (-60 to 0)
      const dbValue = level === 0 ? Number.NEGATIVE_INFINITY : 20 * Math.log10(level) * 2
      volumeRef.current.volume.value = Math.max(-60, Math.min(0, dbValue))
    }
  }

  const muteAudio = () => {
    if (volumeRef.current) {
      volumeRef.current.mute = true
    }
    if (drumBusRef.current) {
      drumBusRef.current.mute = true
    }
  }

  const unmuteAudio = () => {
    if (volumeRef.current) {
      volumeRef.current.mute = false
    }
    if (drumBusRef.current) {
      drumBusRef.current.mute = false
    }
  }

  // Function to get beat analyzer data for visualization
  const getBeatAnalyzerData = () => {
    if (!beatAnalyzerRef.current) return null
    return beatAnalyzerRef.current.getValue() as Float32Array
  }

  return {
    playSound,
    stopSound,
    setAudioVolume,
    muteAudio,
    unmuteAudio,
    audioParams,
    setAudioParams,
    registerBeatCallback,
    getBeatAnalyzerData,
  }
}
