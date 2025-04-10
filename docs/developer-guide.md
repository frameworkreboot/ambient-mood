# Ambient Moods - Developer Guide

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm or npm
- Basic knowledge of React, Next.js, and Three.js

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ambient-moods
```

2. Install dependencies
```bash
pnpm install
# or
npm install
```

3. Start the development server
```bash
pnpm dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Code Structure

```
ambient-moods/
├── app/                 # Next.js app directory (entry points)
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Main page component
├── components/          # React components
│   ├── ui/              # Shadcn UI components
│   ├── emotion-generator.tsx    # Main container component
│   ├── sound-control-sidebar.tsx # Audio control interface
│   ├── visualization-canvas.tsx  # Three.js visualization
│   └── theme-provider.tsx        # Theme context provider
├── hooks/               # Custom React hooks
│   ├── use-audio-engine.ts       # Tone.js audio engine
│   ├── use-data-source.ts        # Data generation logic
│   ├── use-mobile.tsx            # Mobile detection
│   └── use-toast.ts              # Toast notifications
├── public/              # Static assets
└── styles/              # Additional styles
```

## Core Concepts

### 1. Emotion Data Model

The central data structure is the `EmotionData` type defined in `hooks/use-data-source.ts`:

```typescript
type EmotionData = {
  intensity: number // 0-1, how strong the emotion is
  value: number // 0-100, the primary value used for color/sound mapping
  mood: number // -10 to 10, negative to positive emotion spectrum
  weatherInfo?: {
    location: string
    temperature: number
    description: string
    humidity: number
    windSpeed: number
  }
}
```

This data structure is used to:
- Map time, weather, or user inputs to a normalized emotion model
- Translate emotion data into audio parameters
- Drive visualization effects

### 2. Audio Engine

The audio engine (`hooks/use-audio-engine.ts`) uses Tone.js to create synthesized sounds:

- **Key Components**:
  - `PolySynth`: Main melodic synthesizer
  - `Filter`: Frequency filtering for tone shaping
  - `Reverb`: Space and ambience effects
  - Drum synthesizers (kick, snare, hihat)
  - Analyzers for waveform visualization

- **Key Parameters**:
  ```typescript
  type SoundParams = {
    frequency: number      // Base frequency
    modulation: number     // Modulation amount
    resonance: number      // Filter resonance
    oscillatorType?: string // Waveform type (sine, square, etc.)
    filterType?: string    // Filter type (lowpass, highpass, etc.)
    filterFrequency?: number // Filter cutoff frequency
    reverbDecay?: number   // Reverb decay time
    reverbWet?: number     // Reverb wet/dry mix
    attack?: number        // Envelope attack time
    release?: number       // Envelope release time
    harmonicity?: number   // Frequency ratio for harmonics
    drumPattern?: string   // Selected drum pattern
    tempo?: number         // BPM for drum patterns
    drumVolume?: number    // Volume level for drums
    drumFilter?: number    // Filter frequency for drums
  }
  ```

### 3. Visualization System

The visualization system (`components/visualization-canvas.tsx`) uses Three.js to create reactive visuals:

- **Main Components**:
  - `GridShaderMaterial`: Custom shader for grid effects
  - `ParticleField`: 3D particle system
  - `WireframeSphere`: Responsive wireframe geometry
  - `BeatDetector`: Maps audio beats to visual effects

- **Key Techniques**:
  - GLSL Shaders for custom visual effects
  - Three.js geometries and materials
  - `useFrame` hook for animation loops
  - Audio analyzer data mapping to visual parameters

## Development Workflows

### Adding a New Data Source

1. Add a new generator function in `hooks/use-data-source.ts`:
```typescript
const generateNewSourceData = async (): Promise<EmotionData> => {
  // Generate emotion data from new source
  return {
    intensity: 0.5,
    value: 50,
    mood: 0,
    // Add any source-specific info here
  };
}
```

2. Add the new source type to the `refreshData` function:
```typescript
const refreshData = async (type: string = sourceType, overrides?: Partial<EmotionData>) => {
  let newData: EmotionData;

  switch (type) {
    // ... existing cases
    case "newSource":
      newData = await generateNewSourceData();
      break;
    // ...
  }
  // ... rest of function
}
```

3. Update the UI in `components/emotion-generator.tsx` to include the new source:
```tsx
<TabsList className="grid grid-cols-4 mb-4 bg-gray-900">
  <TabsTrigger value="time">Time</TabsTrigger>
  <TabsTrigger value="weather">Weather</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
  <TabsTrigger value="newSource">New Source</TabsTrigger>
</TabsList>

{/* Add content for new tab */}
<TabsContent value="newSource" className="space-y-4">
  {/* New source UI controls */}
</TabsContent>
```

### Adding New Audio Effects

1. Define new parameters in the `SoundParams` type in `hooks/use-audio-engine.ts`:
```typescript
type SoundParams = {
  // ... existing params
  newEffect?: number
}
```

2. Initialize the new audio components in `useEffect` within `useAudioEngine`:
```typescript
if (!newEffectRef.current) {
  newEffectRef.current = new Tone.SomeEffect({
    // Effect parameters
  });
}
```

3. Connect the new effect in the audio chain:
```typescript
// Connect the audio chain
synthRef.current?.connect(filterRef.current);
filterRef.current?.connect(newEffectRef.current);
newEffectRef.current?.connect(reverbRef.current);
// ... rest of chain
```

4. Add UI controls in `components/sound-control-sidebar.tsx`:
```tsx
<div>
  <Label htmlFor="new-effect">New Effect</Label>
  <Slider
    id="new-effect"
    value={[audioParams.newEffect || 0]}
    min={0}
    max={100}
    step={1}
    onValueChange={(value) => {
      onParamsChange({ ...audioParams, newEffect: value[0] });
    }}
  />
</div>
```

### Adding New Visual Effects

1. Create a new component in `components/visualization-canvas.tsx`:
```tsx
function NewVisualEffect({ color, accentColor, intensity, value, mood, beatEnergy = 0 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    // Update animations based on parameters
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * intensity;
      // ... more animations
    }
  });
  
  return (
    <mesh ref={meshRef}>
      {/* Define geometry and materials */}
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
```

2. Add the new component to the `Scene` component:
```tsx
function Scene({ data, bgColor, accentColor, isPlaying }) {
  // ... existing code
  
  return (
    <>
      {/* Existing components */}
      <NewVisualEffect
        color={bgColor}
        accentColor={accentColor}
        intensity={data?.intensity || 0.5}
        value={data?.value || 50}
        mood={data?.mood || 0}
        beatEnergy={beatEnergy}
      />
    </>
  );
}
```

## Best Practices

1. **Performance**
   - Use `useCallback` and `useMemo` for expensive computations
   - Optimize Three.js renders by minimizing state changes
   - Implement render throttling for high-intensity visualizations

2. **Audio**
   - Initialize audio only on user interaction (browser requirement)
   - Implement proper cleanup of audio resources in `useEffect` returns
   - Use audio worklets for complex audio processing when possible

3. **State Management**
   - Keep audio parameters in a single, unified state object
   - Use ref objects for values that don't trigger re-renders
   - Separate UI state from audio/visual processing state

4. **Error Handling**
   - Implement fallbacks for data source failures (e.g., weather API errors)
   - Handle Web Audio API context restrictions gracefully
   - Provide meaningful error messages for debugging

## Troubleshooting

### Common Issues

1. **No audio playing**
   - Verify browser audio permissions
   - Check if audio context is suspended (needs user interaction)
   - Verify audio chain connections

2. **Poor visualization performance**
   - Reduce particle count or complexity of shaders
   - Use Three.js performance tools to identify bottlenecks
   - Consider implementing level-of-detail based on device capabilities

3. **Data source errors**
   - Check API key validity for weather data
   - Implement retry logic for API failures
   - Provide fallback data sources

## API Reference

For detailed API documentation, see the following:

- [Tone.js Documentation](https://tonejs.github.io/)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber) 