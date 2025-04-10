# Ambient Moods - API Reference

This document provides detailed information about the key functions, hooks, and interfaces in the Ambient Moods application.

## Data Models

### EmotionData

Central data structure representing emotional state.

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

### SoundParams

Configuration options for the audio engine.

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

## Hooks

### useDataSource

```typescript
function useDataSource(sourceType: string = "time"): {
  data: EmotionData | null;
  refreshData: (type?: string, overrides?: Partial<EmotionData>) => Promise<void>;
  setLocation: (location: string) => void;
}
```

A hook that generates emotion data from different sources:

- **Parameters:**
  - `sourceType`: The type of data source to use ("time", "weather", or "manual")

- **Returns:**
  - `data`: The current emotion data
  - `refreshData`: Function to refresh the emotion data
  - `setLocation`: Function to update the location for weather data

- **Example:**
```typescript
const { data, refreshData, setLocation } = useDataSource("weather");
setLocation("London");
await refreshData();
```

#### Methods

##### refreshData

```typescript
refreshData(type?: string, overrides?: Partial<EmotionData>): Promise<void>
```

Refreshes the emotion data from the specified source.

- **Parameters:**
  - `type`: The type of data source to use
  - `overrides`: Optional partial emotion data to override generated values

- **Example:**
```typescript
// Refresh data from current source
refreshData();

// Refresh data from weather source
refreshData("weather");

// Refresh data with overrides
refreshData("manual", { intensity: 0.8, mood: 5 });
```

### useAudioEngine

```typescript
function useAudioEngine(): {
  playSound: (params: SoundParams) => Promise<void>;
  stopSound: () => void;
  setAudioVolume: (level: number) => void;
  muteAudio: () => void;
  unmuteAudio: () => void;
  audioParams: Omit<SoundParams, "frequency" | "modulation" | "resonance">;
  setAudioParams: React.Dispatch<React.SetStateAction<Omit<SoundParams, "frequency" | "modulation" | "resonance">>>;
  registerBeatCallback: (callback: (time: number, velocity: number) => void) => () => void;
  getBeatAnalyzerData: () => Float32Array | null;
}
```

A hook that manages the Tone.js audio synthesis engine.

- **Returns:**
  - `playSound`: Function to start playing sound with specified parameters
  - `stopSound`: Function to stop all sound
  - `setAudioVolume`: Function to set the master volume level
  - `muteAudio`: Function to mute all audio
  - `unmuteAudio`: Function to unmute audio
  - `audioParams`: Current audio parameters
  - `setAudioParams`: Function to update audio parameters
  - `registerBeatCallback`: Function to register a callback for beat events
  - `getBeatAnalyzerData`: Function to get current beat analyzer data

- **Example:**
```typescript
const { 
  playSound, 
  stopSound, 
  setAudioVolume,
  audioParams, 
  setAudioParams 
} = useAudioEngine();

// Play a sound
playSound({
  frequency: 440,
  modulation: 5,
  resonance: 0.5,
});

// Update audio parameters
setAudioParams({
  ...audioParams,
  oscillatorType: "square",
  reverbWet: 0.7,
});
```

#### Methods

##### playSound

```typescript
playSound(params: SoundParams): Promise<void>
```

Starts playing sound with the specified parameters.

- **Parameters:**
  - `params`: Sound parameters configuration

##### stopSound

```typescript
stopSound(): void
```

Stops all currently playing sounds.

##### setAudioVolume

```typescript
setAudioVolume(level: number): void
```

Sets the master volume level.

- **Parameters:**
  - `level`: Volume level from 0 to 1

##### registerBeatCallback

```typescript
registerBeatCallback(callback: (time: number, velocity: number) => void): () => void
```

Registers a callback function to be called on beat events.

- **Parameters:**
  - `callback`: Function to call on beat events
- **Returns:**
  - A cleanup function to unregister the callback

## Components

### EmotionGenerator

```typescript
export default function EmotionGenerator(): JSX.Element
```

The main container component that orchestrates the application.

- **Props:** None

- **State:**
  - `isPlaying`: Whether audio is currently playing
  - `isMuted`: Whether audio is muted
  - `volume`: Current volume level (0-100)
  - `activeTab`: Currently selected data source tab
  - `location`: Current location for weather data
  - `sidebarOpen`: Whether the sidebar is open
  - `bgColor`: Current background color
  - `accentColor`: Current accent color

- **Example:**
```tsx
<EmotionGenerator />
```

### VisualizationCanvas

```typescript
export function VisualizationCanvas({ 
  data, 
  bgColor, 
  accentColor, 
  isPlaying 
}: {
  data: EmotionData | null;
  bgColor: string;
  accentColor: string;
  isPlaying: boolean;
}): JSX.Element
```

Three.js based canvas for visual representations of the emotional data.

- **Props:**
  - `data`: Current emotion data
  - `bgColor`: Background color for visualizations
  - `accentColor`: Accent color for visualizations
  - `isPlaying`: Whether audio is currently playing

- **Example:**
```tsx
<VisualizationCanvas
  data={emotionData}
  bgColor="hsl(210, 100%, 50%)"
  accentColor="hsl(280, 100%, 70%)"
  isPlaying={true}
/>
```

### SoundControlSidebar

```typescript
export function SoundControlSidebar({ 
  audioParams, 
  setAudioParams, 
  isPlaying 
}: {
  audioParams: Omit<SoundParams, "frequency" | "modulation" | "resonance">;
  setAudioParams: (params: Omit<SoundParams, "frequency" | "modulation" | "resonance">) => void;
  isPlaying: boolean;
}): JSX.Element
```

Sidebar panel for fine-tuning audio parameters.

- **Props:**
  - `audioParams`: Current audio parameters
  - `setAudioParams`: Function to update audio parameters
  - `isPlaying`: Whether audio is currently playing

- **Example:**
```tsx
<SoundControlSidebar
  audioParams={audioParams}
  setAudioParams={setAudioParams}
  isPlaying={isPlaying}
/>
```

## Utility Functions

### generateTimeBasedData

```typescript
generateTimeBasedData(): EmotionData
```

Generates emotion data based on the current time.

- **Returns:**
  - An `EmotionData` object with:
    - `intensity`: Based on current seconds (creates a pulsing effect)
    - `value`: Based on time of day (0-100)
    - `mood`: Based on time of day (-10 to 10)

### generateWeatherBasedData

```typescript
generateWeatherBasedData(): Promise<EmotionData>
```

Generates emotion data based on weather conditions at the specified location.

- **Returns:**
  - A Promise resolving to an `EmotionData` object with:
    - `intensity`: Based on wind speed and weather conditions
    - `value`: Based on temperature
    - `mood`: Based on weather conditions
    - `weatherInfo`: Additional weather information

### updateDrumPattern

```typescript
updateDrumPattern(pattern: string): void
```

Updates the current drum pattern.

- **Parameters:**
  - `pattern`: The drum pattern to use ("none", "four-on-floor", "breakbeat", etc.)

## Global Configuration

### OpenWeatherMap API

The application uses the OpenWeatherMap API for weather data. The API key is defined in `hooks/use-data-source.ts`:

```typescript
const apiKey = "1c9770dfaf3b327dd03510a4c07b7f2d"; // Free API key for demo purposes
```

Note: This is a free-tier API key with limited usage. For production, it's recommended to use environment variables and a more robust API key management system. 