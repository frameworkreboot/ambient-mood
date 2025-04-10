"use client"

import { useEffect, useState } from "react"
import { Play, Pause, RefreshCw, Volume2, VolumeX, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useAudioEngine } from "@/hooks/use-audio-engine"
import { useDataSource } from "@/hooks/use-data-source"
import { SoundControlSidebar } from "@/components/sound-control-sidebar"
import { VisualizationCanvas } from "@/components/visualization-canvas"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function EmotionGenerator() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(75)
  const [activeTab, setActiveTab] = useState("time")
  const [location, setLocation] = useState("London")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { data, refreshData, setLocation: updateLocation } = useDataSource(activeTab)
  const { playSound, stopSound, setAudioVolume, muteAudio, unmuteAudio, audioParams, setAudioParams } = useAudioEngine()

  const [bgColor, setBgColor] = useState("hsl(210, 100%, 50%)")
  const [accentColor, setAccentColor] = useState("hsl(280, 100%, 70%)")

  useEffect(() => {
    if (data) {
      // Map data to colors and sounds
      const hue = Math.floor((data.value / 100) * 360)
      const saturation = Math.floor(data.intensity * 100)
      const lightness = Math.floor(50 + data.mood / 2)

      setBgColor(`hsl(${hue}, ${saturation}%, ${lightness}%)`)
      setAccentColor(`hsl(${(hue + 120) % 360}, ${saturation}%, ${lightness + 20}%)`)

      if (isPlaying) {
        stopSound()
        playSound({
          frequency: 200 + data.value * 5,
          modulation: data.intensity * 10,
          resonance: data.mood / 10,
          ...audioParams,
        })
      }
    }
  }, [data, isPlaying, audioParams])

  useEffect(() => {
    setAudioVolume(volume / 100)
  }, [volume])

  const handlePlayPause = () => {
    if (isPlaying) {
      stopSound()
    } else {
      playSound({
        frequency: 200 + data.value * 5,
        modulation: data.intensity * 10,
        resonance: data.mood / 10,
        ...audioParams,
      })
    }
    setIsPlaying(!isPlaying)
  }

  const handleMuteToggle = () => {
    if (isMuted) {
      unmuteAudio()
    } else {
      muteAudio()
    }
    setIsMuted(!isMuted)
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
    refreshData(value)
  }

  const handleLocationSubmit = (e) => {
    e.preventDefault()
    updateLocation(location)
    refreshData("weather")
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation(`${position.coords.latitude},${position.coords.longitude}`)
          refreshData("weather")
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  return (
    <SidebarProvider defaultOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex h-screen w-full overflow-hidden">
        <SoundControlSidebar audioParams={audioParams} setAudioParams={setAudioParams} isPlaying={isPlaying} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between p-4 bg-black text-white border-b border-gray-800">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-bold">Ambient Emotion Generator</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePlayPause}
                className="border-gray-700 bg-gray-900 hover:bg-gray-800"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleMuteToggle}
                className="border-gray-700 bg-gray-900 hover:bg-gray-800"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>

              <div className="flex items-center gap-2 ml-4 w-32">
                <Volume2 className="h-4 w-4 text-gray-400" />
                <Slider
                  value={[volume]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVolume(value[0])}
                  className="w-full"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => refreshData(activeTab)}
                className="ml-2 border-gray-700 bg-gray-900 hover:bg-gray-800"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-hidden relative">
            <VisualizationCanvas data={data} bgColor={bgColor} accentColor={accentColor} isPlaying={isPlaying} />

            {data && (
              <div className="absolute bottom-4 left-4 bg-black/30 backdrop-blur-sm p-3 rounded-lg text-white">
                <p>Intensity: {data.intensity.toFixed(2)}</p>
                <p>Value: {data.value.toFixed(2)}</p>
                <p>Mood: {data.mood.toFixed(2)}</p>
                {data.weatherInfo && (
                  <>
                    <p className="mt-2 font-semibold">{data.weatherInfo.location}</p>
                    <p>
                      {data.weatherInfo.description}, {data.weatherInfo.temperature}°C
                    </p>
                  </>
                )}
              </div>
            )}
          </main>

          <footer className="p-4 bg-black text-white border-t border-gray-800">
            <Tabs defaultValue="time" onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4 bg-gray-900">
                <TabsTrigger value="time">Time</TabsTrigger>
                <TabsTrigger value="weather">Weather</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
              </TabsList>

              <TabsContent value="time" className="space-y-4">
                <p className="text-gray-400">
                  Using current time patterns to generate ambient emotions. The time of day influences the color palette
                  and sound texture.
                </p>
              </TabsContent>

              <TabsContent value="weather" className="space-y-4">
                <form onSubmit={handleLocationSubmit} className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter city name"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 bg-gray-900 border-gray-700"
                  />
                  <Button type="submit" variant="secondary">
                    Search
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetCurrentLocation}
                    className="border-gray-700"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Current Location
                  </Button>
                </form>
                <p className="text-gray-400">
                  Using real weather conditions to generate ambient emotions. Temperature, humidity, and conditions
                  affect the experience.
                </p>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Intensity</label>
                    <Slider
                      value={[data?.intensity * 100 || 50]}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        const updatedData = {
                          ...data,
                          intensity: value[0] / 100,
                        }
                        refreshData("manual", updatedData)
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Value</label>
                    <Slider
                      value={[data?.value || 50]}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        const updatedData = {
                          ...data,
                          value: value[0],
                        }
                        refreshData("manual", updatedData)
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Mood</label>
                    <Slider
                      value={[data?.mood || 0]}
                      min={-10}
                      max={10}
                      step={0.1}
                      onValueChange={(value) => {
                        const updatedData = {
                          ...data,
                          mood: value[0],
                        }
                        refreshData("manual", updatedData)
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  )
}
