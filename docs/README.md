# Ambient Moods

Ambient Moods is an interactive web application that generates immersive audio-visual experiences based on various data sources like time, weather, and user input. It creates a unique synesthetic experience by mapping data points to sound parameters and visual effects.

![Ambient Moods Screenshot](../public/screenshot.png)

## Features

- **Dynamic Audio Generation**: Creates ambient soundscapes using Tone.js audio synthesis
- **Reactive Visualizations**: Generates immersive 3D visuals with Three.js
- **Multiple Data Sources**:
  - **Time-based**: Maps the current time to emotions and sounds
  - **Weather-based**: Uses real weather data to generate moods
  - **Manual**: Allows direct control of emotion parameters
- **Advanced Audio Controls**: Fine-tune synthesizer, filter, reverb, and drum pattern settings
- **Beat-reactive Visuals**: Visualizations react to audio beats and tempo

## Getting Started

1. Clone the repository
2. Install dependencies with `pnpm install` or `npm install`
3. Start the development server with `pnpm dev` or `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

For more detailed setup instructions, see the [Developer Guide](developer-guide.md).

## Documentation

- [Architecture Overview](architecture.md): System design and component relationships
- [Developer Guide](developer-guide.md): Detailed guides for setup, development and extending the application
- [API Reference](api-reference.md): Detailed documentation of hooks, components, and interfaces

## How It Works

Ambient Moods combines several technologies to create a unique experience:

1. **Data Mapping**: Various data sources are normalized into an emotion model with intensity, value, and mood parameters
2. **Audio Synthesis**: The emotion data controls synthesizer parameters, filter settings, and effects
3. **Visual Rendering**: Three.js creates shader-based visualizations that respond to both the emotion data and audio output
4. **Reactive UI**: The user interface changes colors and styles based on the current emotional state

The application design follows a component-based architecture with custom hooks for state management and audio processing.

## Contributing

Contributions are welcome! Please see [Developer Guide](developer-guide.md) for guidelines on adding new features, data sources, or visual effects.

## Technology Stack

- **Framework**: Next.js with React
- **Audio**: Tone.js for synthesis and audio processing
- **Visualization**: Three.js (via React Three Fiber) for 3D graphics
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives with custom styling

## License

[MIT License](../LICENSE) 