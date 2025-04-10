"use client"

import { useEffect, useState } from "react"

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

export function useDataSource(sourceType = "time") {
  const [data, setData] = useState<EmotionData | null>(null)
  const [userLocation, setUserLocation] = useState<string>("London")

  const generateTimeBasedData = (): EmotionData => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()

    // Time of day affects the mood (morning/evening positive, afternoon neutral, night mysterious)
    let mood = 0
    if (hours >= 5 && hours < 10)
      mood = 8 // Morning: very positive
    else if (hours >= 10 && hours < 15)
      mood = 5 // Midday: positive
    else if (hours >= 15 && hours < 19)
      mood = 2 // Afternoon: slightly positive
    else if (hours >= 19 && hours < 22)
      mood = -2 // Evening: slightly mysterious
    else mood = -5 // Night: mysterious

    // Seconds create a pulsing intensity
    const intensity = 0.3 + Math.sin((seconds / 60) * Math.PI) * 0.3 + Math.random() * 0.1

    // Minutes + hours create the primary value
    const value = (((hours * 60 + minutes) % (24 * 60)) / (24 * 60)) * 100

    return { intensity, value, mood }
  }

  const generateWeatherBasedData = async (): Promise<EmotionData> => {
    try {
      // Use OpenWeatherMap API (free tier)
      const apiKey = "1c9770dfaf3b327dd03510a4c07b7f2d" // Free API key for demo purposes
      const query = userLocation.includes(",")
        ? `lat=${userLocation.split(",")[0]}&lon=${userLocation.split(",")[1]}`
        : `q=${userLocation}`

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=metric`,
      )

      if (!response.ok) {
        throw new Error("Weather data fetch failed")
      }

      const weatherData = await response.json()

      // Map weather data to emotion parameters
      let intensity = 0.5
      let value = 50
      let mood = 0

      // Temperature affects value (higher temp = higher value)
      const temp = weatherData.main.temp
      value = Math.min(100, Math.max(0, ((temp + 20) / 60) * 100))

      // Weather condition affects mood
      const weatherId = weatherData.weather[0].id
      if (weatherId >= 200 && weatherId < 300) {
        // Thunderstorm
        mood = -7
        intensity = 0.9
      } else if (weatherId >= 300 && weatherId < 400) {
        // Drizzle
        mood = -2
        intensity = 0.4
      } else if (weatherId >= 500 && weatherId < 600) {
        // Rain
        mood = -4
        intensity = 0.7
      } else if (weatherId >= 600 && weatherId < 700) {
        // Snow
        mood = 3
        intensity = 0.5
      } else if (weatherId >= 700 && weatherId < 800) {
        // Atmosphere (fog, mist, etc)
        mood = -1
        intensity = 0.3
      } else if (weatherId === 800) {
        // Clear sky
        mood = 8
        intensity = 0.8
      } else if (weatherId > 800) {
        // Clouds
        mood = 0
        intensity = 0.4 + (weatherId - 800) * 0.1
      }

      // Wind speed affects intensity
      intensity = Math.min(1, intensity + weatherData.wind.speed / 20)

      return {
        intensity,
        value,
        mood,
        weatherInfo: {
          location: weatherData.name,
          temperature: Math.round(weatherData.main.temp),
          description: weatherData.weather[0].description,
          humidity: weatherData.main.humidity,
          windSpeed: weatherData.wind.speed,
        },
      }
    } catch (error) {
      console.error("Error fetching weather data:", error)
      // Fallback to simulated weather data
      const weatherTypes = ["sunny", "cloudy", "rainy", "stormy", "snowy"]
      const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)]

      let intensity = 0.5
      let value = 50
      let mood = 0

      switch (randomWeather) {
        case "sunny":
          intensity = 0.7 + Math.random() * 0.3
          value = 75 + Math.random() * 25
          mood = 7 + Math.random() * 3
          break
        case "cloudy":
          intensity = 0.4 + Math.random() * 0.3
          value = 40 + Math.random() * 20
          mood = 0 + Math.random() * 4 - 2
          break
        case "rainy":
          intensity = 0.5 + Math.random() * 0.3
          value = 30 + Math.random() * 20
          mood = -3 + Math.random() * 4 - 2
          break
        case "stormy":
          intensity = 0.8 + Math.random() * 0.2
          value = 15 + Math.random() * 15
          mood = -7 + Math.random() * 4 - 2
          break
        case "snowy":
          intensity = 0.3 + Math.random() * 0.3
          value = 85 + Math.random() * 15
          mood = 4 + Math.random() * 4 - 2
          break
      }

      return {
        intensity,
        value,
        mood,
        weatherInfo: {
          location: userLocation,
          temperature: Math.round(Math.random() * 30),
          description: randomWeather,
          humidity: Math.round(Math.random() * 100),
          windSpeed: Math.round(Math.random() * 10),
        },
      }
    }
  }

  const generateManualData = (overrides?: Partial<EmotionData>): EmotionData => {
    const defaultData = {
      intensity: 0.5,
      value: 50,
      mood: 0,
    }

    return { ...defaultData, ...overrides }
  }

  const refreshData = async (type: string = sourceType, overrides?: Partial<EmotionData>) => {
    let newData: EmotionData

    switch (type) {
      case "time":
        newData = generateTimeBasedData()
        break
      case "weather":
        newData = await generateWeatherBasedData()
        break
      case "manual":
        // For manual updates, preserve existing data and only update the specified fields
        if (data && overrides) {
          newData = { ...data, ...overrides }
        } else {
          newData = generateManualData(overrides)
        }
        break
      default:
        newData = generateTimeBasedData()
    }

    setData(newData)
  }

  const setLocation = (location: string) => {
    setUserLocation(location)
  }

  useEffect(() => {
    refreshData(sourceType)

    // Set up interval for time-based updates
    if (sourceType === "time") {
      const interval = setInterval(() => {
        refreshData("time")
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [sourceType])

  return { data, refreshData, setLocation }
}
