"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar"
import { Info } from "lucide-react"
import { Switch } from "@/components/ui/switch"

const PRESETS = {
  ambient: {
    oscillatorType: "sine",
    filterType: "lowpass",
    filterFrequency: 1000,
    reverbDecay: 5,
    reverbWet: 0.5,
    attack: 0.5,
    release: 2,
    harmonicity: 1.5,
  },
  bright: {
    oscillatorType: "triangle",
    filterType: "highpass",
    filterFrequency: 2000,
    reverbDecay: 2,
    reverbWet: 0.3,
    attack: 0.1,
    release: 1,
    harmonicity: 2,
  },
  dark: {
    oscillatorType: "sine",
    filterType: "lowpass",
    filterFrequency: 500,
    reverbDecay: 8,
    reverbWet: 0.7,
    attack: 1,
    release: 3,
    harmonicity: 1.2,
  },
  sharp: {
    oscillatorType: "sawtooth",
    filterType: "bandpass",
    filterFrequency: 1500,
    reverbDecay: 1,
    reverbWet: 0.2,
    attack: 0.05,
    release: 0.5,
    harmonicity: 3,
  },
}

export function SoundControlSidebar({ audioParams, setAudioParams, isPlaying }) {
  const [activeTab, setActiveTab] = useState("oscillator")

  const applyPreset = (presetName) => {
    setAudioParams(PRESETS[presetName])
  }

  const handleParamChange = (param, value) => {
    setAudioParams({
      ...audioParams,
      [param]: value,
    })
  }

  return (
    <Sidebar className="border-r border-gray-800 bg-black text-white">
      <SidebarHeader className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold">Sound Controls</h2>
        <p className="text-sm text-gray-400">Customize your sound experience</p>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Button
            size="sm"
            variant="outline"
            onClick={() => applyPreset("ambient")}
            className="border-gray-700 bg-gray-900 hover:bg-gray-800"
          >
            Ambient
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => applyPreset("bright")}
            className="border-gray-700 bg-gray-900 hover:bg-gray-800"
          >
            Bright
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => applyPreset("dark")}
            className="border-gray-700 bg-gray-900 hover:bg-gray-800"
          >
            Dark
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => applyPreset("sharp")}
            className="border-gray-700 bg-gray-900 hover:bg-gray-800"
          >
            Sharp
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4 bg-gray-900">
            <TabsTrigger value="oscillator">Oscillator</TabsTrigger>
            <TabsTrigger value="filter">Filter</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="drums">Drums</TabsTrigger>
          </TabsList>

          <TabsContent value="oscillator" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Enable Oscillator</label>
                <Switch
                  checked={audioParams.oscillatorEnabled !== false}
                  onCheckedChange={(checked) => handleParamChange("oscillatorEnabled", checked)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-300">Oscillator Type</label>
                <Select
                  value={audioParams.oscillatorType}
                  onValueChange={(value) => handleParamChange("oscillatorType", value)}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sine">Sine</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="sawtooth">Sawtooth</SelectItem>
                    <SelectItem value="triangle">Triangle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-300">
                  Attack ({audioParams.attack.toFixed(2)}s)
                </label>
                <Slider
                  value={[audioParams.attack]}
                  min={0.01}
                  max={2}
                  step={0.01}
                  onValueChange={(value) => handleParamChange("attack", value[0])}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-300">
                  Release ({audioParams.release.toFixed(2)}s)
                </label>
                <Slider
                  value={[audioParams.release]}
                  min={0.1}
                  max={5}
                  step={0.1}
                  onValueChange={(value) => handleParamChange("release", value[0])}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-300">
                  Harmonicity ({audioParams.harmonicity.toFixed(2)})
                </label>
                <Slider
                  value={[audioParams.harmonicity]}
                  min={0.5}
                  max={5}
                  step={0.1}
                  onValueChange={(value) => handleParamChange("harmonicity", value[0])}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="filter" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-300">Filter Type</label>
                <Select
                  value={audioParams.filterType}
                  onValueChange={(value) => handleParamChange("filterType", value)}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lowpass">Low Pass</SelectItem>
                    <SelectItem value="highpass">High Pass</SelectItem>
                    <SelectItem value="bandpass">Band Pass</SelectItem>
                    <SelectItem value="notch">Notch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-300">
                  Filter Frequency ({(audioParams.filterFrequency / 1000).toFixed(1)}kHz)
                </label>
                <Slider
                  value={[audioParams.filterFrequency]}
                  min={100}
                  max={10000}
                  step={100}
                  onValueChange={(value) => handleParamChange("filterFrequency", value[0])}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-300">
                  Reverb Decay ({audioParams.reverbDecay.toFixed(1)}s)
                </label>
                <Slider
                  value={[audioParams.reverbDecay]}
                  min={0.1}
                  max={10}
                  step={0.1}
                  onValueChange={(value) => handleParamChange("reverbDecay", value[0])}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-300">
                  Reverb Mix ({(audioParams.reverbWet * 100).toFixed(0)}%)
                </label>
                <Slider
                  value={[audioParams.reverbWet]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => handleParamChange("reverbWet", value[0])}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="drums" className="space-y-4">
            <div className="grid gap-4">
              <div className="bg-gray-800 p-3 rounded-md mb-2 flex items-start">
                <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-300">
                  Drum sounds are generated using built-in synthesizers for maximum reliability. The kick, snare, and
                  hi-hat are all created using different synthesis techniques.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-300">Drum Pattern</label>
                <Select
                  value={audioParams.drumPattern || "none"}
                  onValueChange={(value) => handleParamChange("drumPattern", value)}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Select pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="four-on-floor">Four on Floor</SelectItem>
                    <SelectItem value="dub">Dub</SelectItem>
                    <SelectItem value="breakbeat">Breakbeat</SelectItem>
                    <SelectItem value="ambient">Ambient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-300">
                  Tempo ({audioParams.tempo || 110} BPM)
                </label>
                <Slider
                  value={[audioParams.tempo || 110]}
                  min={60}
                  max={160}
                  step={1}
                  onValueChange={(value) => handleParamChange("tempo", value[0])}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-300">
                  Drum Volume ({((audioParams.drumVolume || 0.5) * 100).toFixed(0)}%)
                </label>
                <Slider
                  value={[audioParams.drumVolume || 0.5]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => handleParamChange("drumVolume", value[0])}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-300">
                  Drum Filter ({((audioParams.drumFilter || 1000) / 1000).toFixed(1)}kHz)
                </label>
                <Slider
                  value={[audioParams.drumFilter || 1000]}
                  min={100}
                  max={8000}
                  step={100}
                  onValueChange={(value) => handleParamChange("drumFilter", value[0])}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-800">
        <div className="h-20 bg-gray-900 rounded-md overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            {!isPlaying && <p className="text-sm text-gray-500">Play sound to see waveform</p>}
          </div>
          <canvas id="waveform" className="w-full h-full" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
