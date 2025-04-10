"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function SoundControlPanel({ audioParams, setAudioParams, isPlaying }) {
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
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle>Sound Controls</CardTitle>
        <CardDescription>Customize your sound experience</CardDescription>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline" onClick={() => applyPreset("ambient")}>
            Ambient Preset
          </Button>
          <Button size="sm" variant="outline" onClick={() => applyPreset("bright")}>
            Bright Preset
          </Button>
          <Button size="sm" variant="outline" onClick={() => applyPreset("dark")}>
            Dark Preset
          </Button>
          <Button size="sm" variant="outline" onClick={() => applyPreset("sharp")}>
            Sharp Preset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="oscillator">Oscillator</TabsTrigger>
            <TabsTrigger value="filter">Filter</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>

          <TabsContent value="oscillator" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Oscillator Type</label>
                <Select
                  value={audioParams.oscillatorType}
                  onValueChange={(value) => handleParamChange("oscillatorType", value)}
                >
                  <SelectTrigger>
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
                <label className="text-sm font-medium mb-1 block">Attack ({audioParams.attack.toFixed(2)}s)</label>
                <Slider
                  value={[audioParams.attack]}
                  min={0.01}
                  max={2}
                  step={0.01}
                  onValueChange={(value) => handleParamChange("attack", value[0])}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Release ({audioParams.release.toFixed(2)}s)</label>
                <Slider
                  value={[audioParams.release]}
                  min={0.1}
                  max={5}
                  step={0.1}
                  onValueChange={(value) => handleParamChange("release", value[0])}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
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
                <label className="text-sm font-medium mb-1 block">Filter Type</label>
                <Select
                  value={audioParams.filterType}
                  onValueChange={(value) => handleParamChange("filterType", value)}
                >
                  <SelectTrigger>
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
                <label className="text-sm font-medium mb-1 block">
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
                <label className="text-sm font-medium mb-1 block">
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
                <label className="text-sm font-medium mb-1 block">
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
        </Tabs>

        <div className="mt-4 pt-4 border-t">
          <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              {!isPlaying && <p className="text-sm text-gray-500">Play sound to see waveform</p>}
            </div>
            <canvas id="waveform" className="w-full h-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
