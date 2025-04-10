# Ambient Moods - Architecture Documentation

## System Overview

Ambient Moods is a web application that generates audio-visual experiences based on different data sources. It creates immersive environments by mapping data points to sound parameters and visual effects, creating a synesthetic experience for users.

## Core Components

### 1. User Interface Components

- **EmotionGenerator** (`components/emotion-generator.tsx`)
  - The main container component that orchestrates the application
  - Provides controls for playing/pausing sound, adjusting volume, and changing data sources
  - Contains the main layout with header, visualization area, and footer

- **SoundControlSidebar** (`components/sound-control-sidebar.tsx`)
  - Sidebar panel for fine-tuning audio parameters
  - Provides controls for oscillator type, filter settings, reverb, and drum patterns

- **VisualizationCanvas** (`components/visualization-canvas.tsx`)
  - Three.js based canvas for visual representations of the emotional data
  - Implements reactive visualizations including grids, particles, and wireframe elements
  - Responds to audio beats for synchronized visual effects

### 2. Data and State Management

- **useDataSource** (`hooks/use-data-source.ts`)
  - Custom hook for generating emotion data from different sources:
    - Time: Maps current time to emotional parameters
    - Weather: Uses weather API data to generate moods and intensities
    - Manual: Allows direct user control of emotion parameters

- **useAudioEngine** (`hooks/use-audio-engine.ts`)
  - Manages the Tone.js audio synthesis engine
  - Creates and connects various synthesizers, effects, and analyzers
  - Provides controls for playing, stopping, and modifying sound properties
  - Implements beat detection for visualization synchronization

### 3. External Integrations

- **Weather API** (OpenWeatherMap)
  - Used to fetch real-time weather data for location-based mood generation
  - Maps weather conditions to emotional parameters

## Data Flow

1. User selects a data source (time, weather, or manual)
2. The `useDataSource` hook generates emotional data with:
   - `intensity`: How strong the emotion is (0-1)
   - `value`: Primary value for mapping (0-100)
   - `mood`: Emotional valence (-10 to +10)

3. The emotional data is used to:
   - Configure audio parameters in the sound engine
   - Update visual elements in the canvas
   - Set color palettes for the UI

4. Audio parameters influence visual elements through:
   - Beat detection triggering visual reactions
   - Audio analyzer data creating real-time waveform visualizations

## Technology Stack

- **Framework**: Next.js with React
- **Audio**: Tone.js for synthesis and audio processing
- **Visualization**: Three.js (via React Three Fiber) for 3D graphics
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives with custom styling

## Design Decisions

### 1. Audio Synthesis vs. Samples

The application uses synthesized audio instead of pre-recorded samples to:
- Allow for infinite variation of sounds
- Enable real-time parameter modification
- Reduce asset size and loading requirements

### 2. Three.js Integration

Three.js was chosen for visualizations to:
- Provide high-performance 3D rendering capabilities
- Enable complex shader-based effects
- Support reactive animations synchronized with audio

### 3. Data Source Flexibility

Multiple data sources were implemented to:
- Provide varied user experiences
- Demonstrate different mappings between data and sensory output
- Allow for both autonomous and manual control modes 