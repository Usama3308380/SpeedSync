"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Play,
  Square,
  Moon,
  Sun,
  MapPin,
  Clock,
  Gauge,
  Route,
  Trash2,
  Navigation,
  ZoomIn,
  ZoomOut,
  Layers,
  Github,
  User,
  ExternalLink,
  Download,
} from "lucide-react"
import { SpeedSyncIcon } from "@/components/speedsync-icon"
import { AchievementPanel } from "@/components/achievement-panel"

interface Journey {
  id: string
  startTime: Date
  endTime: Date
  startLocation: { lat: number; lng: number; name: string }
  endLocation: { lat: number; lng: number; name: string }
  distance: number
  maxSpeed: number
  avgSpeed: number
  duration: number
  mode: TransportMode
  path: { lat: number; lng: number; timestamp: number; speed: number }[]
}

type TransportMode = "walking" | "running" | "car" | "train" | "flight"

const transportModes = [
  { id: "walking" as TransportMode, icon: "🚶", label: "Walking", maxSpeed: 8 },
  { id: "running" as TransportMode, icon: "🏃", label: "Running", maxSpeed: 25 },
  { id: "car" as TransportMode, icon: "🚗", label: "Car", maxSpeed: 200 },
  { id: "train" as TransportMode, icon: "🚆", label: "Train", maxSpeed: 300 },
  { id: "flight" as TransportMode, icon: "✈️", label: "Flight", maxSpeed: 900 },
]

const mapStyles = [
  { id: "standard", name: "Standard", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
  {
    id: "satellite",
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
  { id: "terrain", name: "Terrain", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
]

export default function SpeedometerApp() {
  const [darkMode, setDarkMode] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [maxSpeed, setMaxSpeed] = useState(0)
  const [avgSpeed, setAvgSpeed] = useState(0)
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)
  const [selectedMode, setSelectedMode] = useState<TransportMode>("car")
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [startLocation, setStartLocation] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [journeyPath, setJourneyPath] = useState<{ lat: number; lng: number; timestamp: number; speed: number }[]>([])
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showIconShowcase, setShowIconShowcase] = useState(false)
  const [mapStyle, setMapStyle] = useState("satellite")
  const [mapZoom, setMapZoom] = useState(15)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 40.7128, lng: -74.006 })

  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null)
  const [speedLimit, setSpeedLimit] = useState(50) // Default speed limit
  const [speedAlerts, setSpeedAlerts] = useState(true)
  const [altitude, setAltitude] = useState<number | null>(null)
  const [elevationGain, setElevationGain] = useState(0)
  const [elevationLoss, setElevationLoss] = useState(0)
  const [heading, setHeading] = useState<number | null>(null)
  const [weather, setWeather] = useState<{
    temp: number
    condition: string
    icon: string
    description: string
  } | null>(null)
  const [achievements, setAchievements] = useState<string[]>([])
  const [showAchievements, setShowAchievements] = useState(false)
  const [lastAltitude, setLastAltitude] = useState<number | null>(null)

  const watchIdRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const lastPositionRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null)
  const speedHistoryRef = useRef<number[]>([])

  const elevationHistoryRef = useRef<number[]>([])
  const achievementCheckRef = useRef<{
    maxSpeedReached: number
    totalDistance: number
    longestJourney: number
  }>({ maxSpeedReached: 0, totalDistance: 0, longestJourney: 0 })

  const currentMode = transportModes.find((mode) => mode.id === selectedMode)!
  const currentMapStyle = mapStyles.find((style) => style.id === mapStyle)!

  // Load journeys from localStorage on mount
  useEffect(() => {
    const savedJourneys = localStorage.getItem("speedometer-journeys")
    if (savedJourneys) {
      setJourneys(
        JSON.parse(savedJourneys).map((j: any) => ({
          ...j,
          startTime: new Date(j.startTime),
          endTime: new Date(j.endTime),
        })),
      )
    }
  }, [])

  // Save journeys to localStorage
  const saveJourneys = (newJourneys: Journey[]) => {
    localStorage.setItem("speedometer-journeys", JSON.stringify(newJourneys))
    setJourneys(newJourneys)
  }

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Get location name (simplified)
  const getLocationName = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }

  // Convert lat/lng to tile coordinates
  const latLngToTile = (lat: number, lng: number, zoom: number) => {
    const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom))
    const y = Math.floor(
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
        Math.pow(2, zoom),
    )
    return { x, y }
  }

  // Get tile URL
  const getTileUrl = (x: number, y: number, zoom: number, styleUrl: string) => {
    return styleUrl
      .replace("{x}", x.toString())
      .replace("{y}", y.toString())
      .replace("{z}", zoom.toString())
      .replace("{s}", ["a", "b", "c"][Math.floor(Math.random() * 3)])
  }

  // Start tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    setIsTracking(true)
    startTimeRef.current = Date.now()
    setDistance(0)
    setMaxSpeed(0)
    setAvgSpeed(0)
    setDuration(0)
    speedHistoryRef.current = []
    setJourneyPath([])

    // Get initial position
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords
      setCurrentLocation({ lat: latitude, lng: longitude })
      setMapCenter({ lat: latitude, lng: longitude })
      setStartLocation({
        lat: latitude,
        lng: longitude,
        name: getLocationName(latitude, longitude),
      })
      lastPositionRef.current = { lat: latitude, lng: longitude, timestamp: Date.now() }
    })

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, accuracy, altitude: posAltitude, heading: posHeading } = position.coords
        const timestamp = Date.now()

        // Update GPS accuracy
        setGpsAccuracy(accuracy || null)

        // Update altitude and elevation tracking
        if (posAltitude !== null) {
          setAltitude(posAltitude)

          if (lastAltitude !== null) {
            const elevationChange = posAltitude - lastAltitude
            if (elevationChange > 0) {
              setElevationGain((prev) => prev + elevationChange)
            } else {
              setElevationLoss((prev) => prev + Math.abs(elevationChange))
            }
          }
          setLastAltitude(posAltitude)
          elevationHistoryRef.current.push(posAltitude)
        }

        // Update heading/compass
        if (posHeading !== null) {
          setHeading(posHeading)
        }

        setCurrentLocation({ lat: latitude, lng: longitude })
        setMapCenter({ lat: latitude, lng: longitude })

        // Calculate speed if not provided by GPS
        let calculatedSpeed = speed ? speed * 3.6 : 0 // Convert m/s to km/h

        if (!speed && lastPositionRef.current) {
          const timeDiff = (timestamp - lastPositionRef.current.timestamp) / 1000 // seconds
          const dist = calculateDistance(lastPositionRef.current.lat, lastPositionRef.current.lng, latitude, longitude)
          calculatedSpeed = timeDiff > 0 ? (dist / timeDiff) * 3600 : 0 // km/h
        }

        setCurrentSpeed(Math.max(0, calculatedSpeed))

        // Speed alert check
        if (speedAlerts && calculatedSpeed > speedLimit) {
          // You could add audio alert or vibration here
          console.log(`Speed alert! Current: ${Math.round(calculatedSpeed)} km/h, Limit: ${speedLimit} km/h`)
        }

        // Update max speed
        setMaxSpeed((prev) => Math.max(prev, calculatedSpeed))

        // Update distance
        if (lastPositionRef.current) {
          const dist = calculateDistance(lastPositionRef.current.lat, lastPositionRef.current.lng, latitude, longitude)
          setDistance((prev) => prev + dist)
        }

        // Update path
        setJourneyPath((prev) => [...prev, { lat: latitude, lng: longitude, timestamp, speed: calculatedSpeed }])

        // Update speed history for average calculation
        speedHistoryRef.current.push(calculatedSpeed)
        const avgSpd = speedHistoryRef.current.reduce((a, b) => a + b, 0) / speedHistoryRef.current.length
        setAvgSpeed(avgSpd)

        // Check achievements
        checkAchievements(calculatedSpeed, distance)

        lastPositionRef.current = { lat: latitude, lng: longitude, timestamp }
      },
      (error) => {
        console.error("Geolocation error:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )
  }

  // Stop tracking
  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    setIsTracking(false)

    // Save journey
    if (startLocation && currentLocation && startTimeRef.current) {
      const endTime = new Date()
      const journey: Journey = {
        id: Date.now().toString(),
        startTime: new Date(startTimeRef.current),
        endTime,
        startLocation,
        endLocation: {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          name: getLocationName(currentLocation.lat, currentLocation.lng),
        },
        distance,
        maxSpeed,
        avgSpeed,
        duration: duration,
        mode: selectedMode,
        path: journeyPath,
      }

      saveJourneys([journey, ...journeys])
    }
  }

  // Update duration
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTracking && startTimeRef.current) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current!) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking])

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Get speed percentage for animations
  const getSpeedPercentage = (speed: number, maxSpeedForMode: number) => {
    return Math.min((speed / maxSpeedForMode) * 100, 100)
  }

  // Clear all journeys
  const clearHistory = () => {
    localStorage.removeItem("speedometer-journeys")
    setJourneys([])
  }

  // Generate OpenStreetMap tiles
  const generateMapTiles = () => {
    const mapWidth = 300
    const mapHeight = 200
    const tileSize = 256

    // Calculate which tiles we need
    const centerTile = latLngToTile(mapCenter.lat, mapCenter.lng, mapZoom)
    const tilesX = Math.ceil(mapWidth / tileSize) + 1
    const tilesY = Math.ceil(mapHeight / tileSize) + 1

    const tiles = []
    for (let x = centerTile.x - Math.floor(tilesX / 2); x <= centerTile.x + Math.floor(tilesX / 2); x++) {
      for (let y = centerTile.y - Math.floor(tilesY / 2); y <= centerTile.y + Math.floor(tilesY / 2); y++) {
        if (x >= 0 && y >= 0 && x < Math.pow(2, mapZoom) && y < Math.pow(2, mapZoom)) {
          tiles.push({ x, y })
        }
      }
    }

    return tiles
  }

  // Convert coordinates to screen position
  const coordToScreen = (lat: number, lng: number) => {
    const mapWidth = 300
    const mapHeight = 200

    // Simple projection for demo - in real implementation you'd use proper map projection
    const centerTile = latLngToTile(mapCenter.lat, mapCenter.lng, mapZoom)
    const pointTile = latLngToTile(lat, lng, mapZoom)

    const x = mapWidth / 2 + (pointTile.x - centerTile.x) * 256
    const y = mapHeight / 2 + (pointTile.y - centerTile.y) * 256

    return { x, y }
  }

  // Weather fetching function
  const fetchWeather = async (lat: number, lng: number) => {
    try {
      const API_KEY = "your_openweather_api_key" // You'll need to get this from OpenWeatherMap
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`,
      )
      const data = await response.json()

      setWeather({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        description: data.weather[0].description,
      })
    } catch (error) {
      console.error("Weather fetch error:", error)
      // Fallback weather data
      setWeather({
        temp: 22,
        condition: "Clear",
        icon: "01d",
        description: "clear sky",
      })
    }
  }

  // Achievement checking function
  const checkAchievements = (speed: number, dist: number) => {
    const newAchievements: string[] = []

    // Speed achievements
    if (speed > 100 && !achievements.includes("speed_demon")) {
      newAchievements.push("speed_demon")
    }
    if (speed > 50 && !achievements.includes("highway_cruiser")) {
      newAchievements.push("highway_cruiser")
    }

    // Distance achievements
    if (dist > 100 && !achievements.includes("century_rider")) {
      newAchievements.push("century_rider")
    }
    if (dist > 10 && !achievements.includes("explorer")) {
      newAchievements.push("explorer")
    }

    // Journey duration achievements
    if (duration > 3600 && !achievements.includes("endurance_master")) {
      newAchievements.push("endurance_master")
    }

    if (newAchievements.length > 0) {
      setAchievements((prev) => [...prev, ...newAchievements])
      setShowAchievements(true)
      setTimeout(() => setShowAchievements(false), 3000)
    }
  }

  // Get weather icon component
  const getWeatherIcon = (condition: string, isDay = true) => {
    const iconMap: { [key: string]: string } = {
      Clear: isDay ? "☀️" : "🌙",
      Clouds: "☁️",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Thunderstorm: "⛈️",
      Snow: "❄️",
      Mist: "🌫️",
      Fog: "🌫️",
    }
    return iconMap[condition] || "🌤️"
  }

  // Get compass direction
  const getCompassDirection = (heading: number) => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ]
    const index = Math.round(heading / 22.5) % 16
    return directions[index]
  }

  // Achievement definitions
  const achievementDefs = {
    speed_demon: { name: "Speed Demon", desc: "Reached 100+ km/h", icon: "🏎️" },
    highway_cruiser: { name: "Highway Cruiser", desc: "Reached 50+ km/h", icon: "🛣️" },
    century_rider: { name: "Century Rider", desc: "Traveled 100+ km", icon: "🚴" },
    explorer: { name: "Explorer", desc: "Traveled 10+ km", icon: "🗺️" },
    endurance_master: { name: "Endurance Master", desc: "Journey over 1 hour", icon: "⏱️" },
  }

  // Fetch weather when location changes
  useEffect(() => {
    if (currentLocation) {
      fetchWeather(currentLocation.lat, currentLocation.lng)
    }
  }, [currentLocation])

  // Load achievements from localStorage
  useEffect(() => {
    const savedAchievements = localStorage.getItem("speedometer-achievements")
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements))
    }
  }, [])

  // Save achievements to localStorage
  useEffect(() => {
    if (achievements.length > 0) {
      localStorage.setItem("speedometer-achievements", JSON.stringify(achievements))
    }
  }, [achievements])

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-slate-900" : "bg-gray-50"}`}>
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Animated Header with SpeedSync Branding */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative">
            {/* Header with Icon and Title */}
            <div className="relative flex items-center gap-4">
              {/* SpeedSync Icon with Animation */}
              <SpeedSyncIcon size={48} darkMode={darkMode} animated={true} />

              {/* Main Title - Clean and Simple */}
              <div>
                <h1
                  className={`text-4xl md:text-5xl font-black tracking-tight transition-all duration-700 ${
                    darkMode
                      ? "bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400"
                      : "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600"
                  } bg-clip-text text-transparent`}
                >
                  SpeedSync
                </h1>

                {/* Subtitle */}
                <p
                  className={`text-sm font-medium transition-all duration-500 ${
                    darkMode ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  Real-time GPS Speed Tracking
                </p>
              </div>
            </div>
          </div>

          {/* Achievement Button in Header */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className={`rounded-full transition-all duration-300 ${
                darkMode
                  ? "text-gray-50 hover:bg-slate-800 hover:text-violet-400 hover:scale-110"
                  : "text-gray-900 hover:bg-white hover:text-indigo-600 hover:scale-110"
              }`}
            >
              <Clock className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAchievements(!showAchievements)}
              className={`rounded-full transition-all duration-300 relative ${
                darkMode
                  ? "text-gray-50 hover:bg-slate-800 hover:text-violet-400 hover:scale-110"
                  : "text-gray-900 hover:bg-white hover:text-indigo-600 hover:scale-110"
              }`}
            >
              <span className="text-lg">🏆</span>
              {achievements.length > 0 && (
                <div
                  className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                    darkMode ? "bg-yellow-400 text-slate-900" : "bg-yellow-500 text-white"
                  }`}
                >
                  {achievements.length}
                </div>
              )}
            </Button>

            <div
              className={`flex items-center gap-2 rounded-full p-2 transition-all duration-300 ${
                darkMode ? "bg-slate-800/50 backdrop-blur-lg" : "bg-white/70 backdrop-blur-lg"
              }`}
            >
              <Sun
                className={`w-4 h-4 transition-all duration-300 ${darkMode ? "text-slate-400" : "text-yellow-400"}`}
              />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <Moon
                className={`w-4 h-4 transition-all duration-300 ${darkMode ? "text-violet-400" : "text-slate-400"}`}
              />
            </div>
          </div>
        </div>

        {/* GPS & System Status Bar */}
        <div className="mb-4">
          <div
            className={`p-3 rounded-xl backdrop-blur-xl transition-all duration-300 ${
              darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/70 border border-white/20"
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              {/* GPS Accuracy */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    gpsAccuracy && gpsAccuracy < 10
                      ? "bg-green-400 animate-pulse"
                      : gpsAccuracy && gpsAccuracy < 20
                        ? "bg-yellow-400"
                        : "bg-red-400"
                  }`}
                ></div>
                <span className={darkMode ? "text-slate-400" : "text-gray-500"}>
                  GPS: {gpsAccuracy ? `±${Math.round(gpsAccuracy)}m` : "Searching..."}
                </span>
              </div>

              {/* Compass */}
              {heading !== null && (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 transition-transform duration-300 ${darkMode ? "text-violet-400" : "text-indigo-600"}`}
                    style={{ transform: `rotate(${heading}deg)` }}
                  >
                    🧭
                  </div>
                  <span className={darkMode ? "text-slate-400" : "text-gray-500"}>
                    {getCompassDirection(heading)} {Math.round(heading)}°
                  </span>
                </div>
              )}

              {/* Weather */}
              {weather && (
                <div className="flex items-center gap-2">
                  <span className="text-lg animate-bounce">{getWeatherIcon(weather.condition)}</span>
                  <span className={darkMode ? "text-slate-400" : "text-gray-500"}>{weather.temp}°C</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {showAchievements ? (
          /* Achievement Panel */
          <AchievementPanel
            darkMode={darkMode}
            achievements={achievements}
            onClose={() => setShowAchievements(false)}
          />
        ) : showIconShowcase ? (
          /* Icon Showcase Section */
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? "text-gray-50" : "text-gray-900"}`}>App Icon Design</h2>
                <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  Custom SpeedSync icon variations
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowIconShowcase(false)}
                className={`rounded-full transition-all duration-300 ${
                  darkMode
                    ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                    : "border-gray-300 text-gray-700 hover:bg-white"
                }`}
              >
                Back
              </Button>
            </div>

            <div className="space-y-6">
              {/* Main Icon Display */}
              <div
                className={`p-8 rounded-2xl backdrop-blur-xl transition-all duration-300 text-center ${
                  darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/70 border border-white/20"
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-50" : "text-gray-900"}`}>
                  Primary App Icon
                </h3>
                <div className="flex justify-center mb-4">
                  <SpeedSyncIcon size={120} darkMode={darkMode} animated={true} />
                </div>
                <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  Interactive icon with hover animations and theme adaptation
                </p>
              </div>

              {/* Size Variations */}
              <div
                className={`p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 ${
                  darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/70 border border-white/20"
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-50" : "text-gray-900"}`}>
                  Size Variations
                </h3>
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  <div className="text-center">
                    <SpeedSyncIcon size={32} darkMode={darkMode} animated={false} />
                    <p className={`text-xs mt-2 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>32px</p>
                  </div>
                  <div className="text-center">
                    <SpeedSyncIcon size={48} darkMode={darkMode} animated={false} />
                    <p className={`text-xs mt-2 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>48px</p>
                  </div>
                  <div className="text-center">
                    <SpeedSyncIcon size={64} darkMode={darkMode} animated={false} />
                    <p className={`text-xs mt-2 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>64px</p>
                  </div>
                  <div className="text-center">
                    <SpeedSyncIcon size={96} darkMode={darkMode} animated={false} />
                    <p className={`text-xs mt-2 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>96px</p>
                  </div>
                </div>
              </div>

              {/* Theme Comparison */}
              <div
                className={`p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 ${
                  darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/70 border border-white/20"
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-50" : "text-gray-900"}`}>
                  Theme Variations
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="bg-gray-100 p-4 rounded-xl mb-2">
                      <SpeedSyncIcon size={80} darkMode={false} animated={false} />
                    </div>
                    <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Light Mode</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-slate-900 p-4 rounded-xl mb-2">
                      <SpeedSyncIcon size={80} darkMode={true} animated={false} />
                    </div>
                    <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Dark Mode</p>
                  </div>
                </div>
              </div>

              {/* Design Features */}
              <div
                className={`p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 ${
                  darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/70 border border-white/20"
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-50" : "text-gray-900"}`}>
                  Design Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: "🎨", title: "Gradient Colors", desc: "Matches app's color scheme perfectly" },
                    { icon: "⚡", title: "Animated Elements", desc: "Interactive hover effects and pulsing" },
                    { icon: "🌓", title: "Theme Adaptive", desc: "Automatically adjusts to light/dark mode" },
                    { icon: "📱", title: "Scalable Design", desc: "Crisp at all sizes from 16px to 512px" },
                    { icon: "🎯", title: "Speed Focused", desc: "Speedometer needle and digital display" },
                    { icon: "✨", title: "Modern Aesthetic", desc: "Glassmorphism and premium effects" },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <div>
                        <h4 className={`font-semibold ${darkMode ? "text-gray-50" : "text-gray-900"}`}>
                          {feature.title}
                        </h4>
                        <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Section */}
              <div
                className={`p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 text-center ${
                  darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/70 border border-white/20"
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-50" : "text-gray-900"}`}>
                  Ready for Production
                </h3>
                <p className={`text-sm mb-4 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  This icon is designed to work perfectly across all platforms and devices
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full transition-all duration-300 ${
                      darkMode
                        ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                        : "border-gray-300 text-gray-700 hover:bg-white"
                    }`}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export SVG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full transition-all duration-300 ${
                      darkMode
                        ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                        : "border-gray-300 text-gray-700 hover:bg-white"
                    }`}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PNG
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : !showHistory ? (
          <>
            {/* Transport Mode Selector */}
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {transportModes.map((mode) => (
                  <Button
                    key={mode.id}
                    variant={selectedMode === mode.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMode(mode.id)}
                    disabled={isTracking}
                    className={`flex-shrink-0 rounded-full transition-all duration-300 ${
                      selectedMode === mode.id
                        ? darkMode
                          ? "bg-violet-500 hover:bg-violet-600 text-white shadow-lg scale-105"
                          : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg scale-105"
                        : darkMode
                          ? "border-slate-600 text-slate-300 hover:bg-slate-800/50 backdrop-blur-lg"
                          : "border-gray-300 text-gray-700 hover:bg-white/50 backdrop-blur-lg"
                    }`}
                  >
                    <span className="mr-2 text-lg">{mode.icon}</span>
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Speed Limit & Alerts */}
            <div className="mb-6">
              <div
                className={`p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 ${
                  darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/70 border border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-semibold ${darkMode ? "text-gray-50" : "text-gray-900"}`}>
                    Speed Settings
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Alerts</span>
                    <Switch checked={speedAlerts} onCheckedChange={setSpeedAlerts} />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                      Speed Limit (km/h)
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="120"
                      step="10"
                      value={speedLimit}
                      onChange={(e) => setSpeedLimit(Number(e.target.value))}
                      disabled={isTracking}
                      className="w-full mt-1"
                    />
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      currentSpeed > speedLimit && speedAlerts
                        ? "text-red-500 animate-pulse"
                        : darkMode
                          ? "text-violet-400"
                          : "text-indigo-600"
                    }`}
                  >
                    {speedLimit}
                  </div>
                </div>

                {currentSpeed > speedLimit && speedAlerts && (
                  <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                      <span className="animate-pulse">⚠️</span>
                      Speed limit exceeded! Slow down for safety.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modern Digital Speedometer */}
            <div className="mb-6">
              <div
                className={`relative p-8 rounded-3xl shadow-2xl backdrop-blur-xl transition-all duration-300 ${
                  darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/70 border border-white/20"
                }`}
              >
                {/* Speed Display */}
                <div className="text-center mb-6">
                  <div className="relative">
                    <div
                      className={`text-7xl font-black transition-all duration-300 ${
                        darkMode ? "text-violet-400" : "text-indigo-600"
                      }`}
                    >
                      {Math.round(currentSpeed)}
                    </div>
                    <div className={`text-lg font-medium mt-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                      km/h
                    </div>
                  </div>
                </div>

                {/* Modern Progress Ring */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={darkMode ? "#475569" : "#e5e7eb"}
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    {/* Progress ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#speedGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(getSpeedPercentage(currentSpeed, currentMode.maxSpeed) * 283) / 100} 283`}
                      className="transition-all duration-500 ease-out"
                    />
                    <defs>
                      <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={darkMode ? "#34d399" : "#10b981"} />
                        <stop offset="50%" stopColor={darkMode ? "#fcd34d" : "#facc15"} />
                        <stop offset="100%" stopColor={darkMode ? "#f87171" : "#ef4444"} />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                      Max: {currentMode.maxSpeed}
                    </div>
                    <div className={`text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                      {Math.round(getSpeedPercentage(currentSpeed, currentMode.maxSpeed))}%
                    </div>
                  </div>
                </div>

                {/* Speed indicator bars */}
                {/* Coming Soon - Enhanced Transport Animations */}
                <div className="flex justify-center mb-4 h-20 relative overflow-hidden">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div
                      className={`p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 text-center ${
                        darkMode ? "bg-slate-800/30 border border-slate-700/30" : "bg-white/30 border border-white/30"
                      }`}
                    >
                      <div className="text-3xl mb-2 animate-pulse">🚀</div>
                      <div className={`text-sm font-semibold ${darkMode ? "text-violet-400" : "text-indigo-600"}`}>
                        Coming Soon
                      </div>
                      <div className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                        Crazy transport animations in future update!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: "Distance", value: `${distance.toFixed(2)} km`, icon: Route, highlight: false },
                { label: "Duration", value: formatDuration(duration), icon: Clock, highlight: false },
                { label: "Max Speed", value: `${Math.round(maxSpeed)} km/h`, icon: Gauge, highlight: true },
                { label: "Avg Speed", value: `${Math.round(avgSpeed)} km/h`, icon: Navigation, highlight: true },
                ...(altitude !== null
                  ? [
                      { label: "Altitude", value: `${Math.round(altitude)} m`, icon: MapPin, highlight: false },
                      { label: "Elevation ↗", value: `${Math.round(elevationGain)} m`, icon: MapPin, highlight: false },
                    ]
                  : []),
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl shadow-lg backdrop-blur-xl transition-all duration-300 ${
                    darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/70 border border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        darkMode
                          ? "bg-gradient-to-r from-violet-500 to-violet-600"
                          : "bg-gradient-to-r from-indigo-500 to-indigo-600"
                      }`}
                    >
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div
                        className={`text-lg font-bold ${
                          stat.highlight
                            ? darkMode
                              ? "text-amber-300"
                              : "text-yellow-400"
                            : darkMode
                              ? "text-gray-50"
                              : "text-gray-900"
                        }`}
                      >
                        {stat.value}
                      </div>
                      <div className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* OpenStreetMap Integration */}
            {(startLocation || currentLocation) && (
              <div
                className={`mb-6 p-4 rounded-2xl shadow-lg backdrop-blur-xl transition-all duration-300 ${
                  darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/70 border border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-5 h-5 ${darkMode ? "text-violet-400" : "text-indigo-600"}`} />
                    <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-50" : "text-gray-900"}`}>Live Map</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Map Style Selector */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentIndex = mapStyles.findIndex((s) => s.id === mapStyle)
                        const nextIndex = (currentIndex + 1) % mapStyles.length
                        setMapStyle(mapStyles[nextIndex].id)
                      }}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        darkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-white/50 text-gray-700"
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                    </Button>
                    {/* Zoom Controls */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMapZoom(Math.min(18, mapZoom + 1))}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          darkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-white/50 text-gray-700"
                        }`}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMapZoom(Math.max(10, mapZoom - 1))}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          darkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-white/50 text-gray-700"
                        }`}
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Map Container */}
                <div
                  className={`h-48 rounded-xl overflow-hidden relative transition-all duration-300 ${
                    darkMode ? "bg-slate-900" : "bg-gray-100"
                  }`}
                >
                  {/* Map Tiles Background */}
                  <div className="absolute inset-0">
                    {generateMapTiles().map((tile, index) => (
                      <img
                        key={`${tile.x}-${tile.y}-${index}`}
                        src={getTileUrl(tile.x, tile.y, mapZoom, currentMapStyle.url) || "/placeholder.svg"}
                        alt="Map tile"
                        className="absolute w-64 h-64 object-cover"
                        style={{
                          left: `${150 + (tile.x - latLngToTile(mapCenter.lat, mapCenter.lng, mapZoom).x) * 256}px`,
                          top: `${100 + (tile.y - latLngToTile(mapCenter.lat, mapCenter.lng, mapZoom).y) * 256}px`,
                        }}
                        onError={(e) => {
                          // Fallback for failed tiles
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    ))}
                  </div>

                  {/* Map Overlay with Path and Markers */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Journey path */}
                    {journeyPath.length > 1 && (
                      <path
                        d={`M ${journeyPath
                          .map((point) => {
                            const { x, y } = coordToScreen(point.lat, point.lng)
                            return `${x},${y}`
                          })
                          .join(" L ")}`}
                        fill="none"
                        stroke="url(#pathGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.8"
                      />
                    )}

                    {/* Gradient for path */}
                    <defs>
                      <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={darkMode ? "#34d399" : "#10b981"} />
                        <stop offset="50%" stopColor={darkMode ? "#8b5cf6" : "#6366f1"} />
                        <stop offset="100%" stopColor={darkMode ? "#f87171" : "#ef4444"} />
                      </linearGradient>
                    </defs>

                    {/* Start location marker */}
                    {startLocation && (
                      <g>
                        {(() => {
                          const { x, y } = coordToScreen(startLocation.lat, startLocation.lng)
                          return (
                            <>
                              <circle
                                cx={x}
                                cy={y}
                                r="12"
                                fill={darkMode ? "#34d399" : "#10b981"}
                                stroke="white"
                                strokeWidth="3"
                                opacity="0.9"
                              />
                              <text x={x} y={y + 5} textAnchor="middle" className="text-sm font-bold fill-white">
                                A
                              </text>
                            </>
                          )
                        })()}
                      </g>
                    )}

                    {/* Current location marker */}
                    {currentLocation && isTracking && (
                      <g>
                        {(() => {
                          const { x, y } = coordToScreen(currentLocation.lat, currentLocation.lng)
                          return (
                            <>
                              <circle
                                cx={x}
                                cy={y}
                                r="12"
                                fill={darkMode ? "#f87171" : "#ef4444"}
                                stroke="white"
                                strokeWidth="3"
                                opacity="0.9"
                              >
                                <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" />
                              </circle>
                              <text x={x} y={y + 5} textAnchor="middle" className="text-sm font-bold fill-white">
                                B
                              </text>
                            </>
                          )
                        })()}
                      </g>
                    )}

                    {/* Speed indicators along path */}
                    {journeyPath.length > 0 &&
                      journeyPath
                        .filter((_, index) => index % Math.max(1, Math.floor(journeyPath.length / 8)) === 0)
                        .map((point, index) => {
                          const { x, y } = coordToScreen(point.lat, point.lng)
                          const speedColor =
                            point.speed > 50
                              ? darkMode
                                ? "#f87171"
                                : "#ef4444"
                              : point.speed > 20
                                ? darkMode
                                  ? "#fcd34d"
                                  : "#facc15"
                                : darkMode
                                  ? "#34d399"
                                  : "#10b981"
                          return (
                            <circle key={index} cx={x} cy={y} r="3" fill={speedColor} opacity="0.8">
                              <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
                            </circle>
                          )
                        })}
                  </svg>

                  {/* Map Info Overlay */}
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="text-xs text-white font-medium">{currentMapStyle.name}</div>
                    <div className="text-xs text-gray-300">Zoom: {mapZoom}</div>
                  </div>
                </div>

                {/* Location Info */}
                <div className="mt-3 space-y-1">
                  {startLocation && (
                    <div className={`text-xs flex items-center gap-2 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                      <div className={`w-2 h-2 rounded-full ${darkMode ? "bg-green-400" : "bg-emerald-500"}`}></div>
                      Start: {startLocation.name}
                    </div>
                  )}
                  {currentLocation && isTracking && (
                    <div className={`text-xs flex items-center gap-2 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                      <div
                        className={`w-2 h-2 rounded-full animate-pulse ${darkMode ? "bg-red-400" : "bg-red-500"}`}
                      ></div>
                      Current: {getLocationName(currentLocation.lat, currentLocation.lng)}
                    </div>
                  )}
                  <div className={`text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                    Path points: {journeyPath.length} • Powered by OpenStreetMap
                  </div>
                </div>
              </div>
            )}

            {/* Control Button */}
            <div className="flex justify-center mb-8">
              <Button
                size="lg"
                onClick={isTracking ? stopTracking : startTracking}
                className={`w-24 h-24 rounded-full text-white font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                  isTracking
                    ? darkMode
                      ? "bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 animate-pulse"
                      : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse"
                    : darkMode
                      ? "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                }`}
              >
                {isTracking ? <Square className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </Button>
            </div>
          </>
        ) : (
          /* History Section */
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? "text-gray-50" : "text-gray-900"}`}>Journey History</h2>
                <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Your tracked journeys</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                  className={`rounded-full transition-all duration-300 ${
                    darkMode
                      ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                      : "border-gray-300 text-gray-700 hover:bg-white"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                  className={`rounded-full transition-all duration-300 ${
                    darkMode
                      ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                      : "border-gray-300 text-gray-700 hover:bg-white"
                  }`}
                >
                  Back
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {journeys.length === 0 ? (
                  <div
                    className={`p-8 text-center rounded-2xl backdrop-blur-xl transition-all duration-300 ${
                      darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/70 border border-white/20"
                    }`}
                  >
                    <Gauge className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-slate-600" : "text-gray-400"}`} />
                    <p className={`text-lg font-medium ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                      No journeys yet
                    </p>
                    <p className={`text-sm ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                      Start tracking to see your history!
                    </p>
                  </div>
                ) : (
                  journeys.map((journey) => {
                    const mode = transportModes.find((m) => m.id === journey.mode)!
                    return (
                      <div
                        key={journey.id}
                        className={`p-4 rounded-2xl shadow-lg backdrop-blur-xl transition-all duration-300 ${
                          darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/70 border border-white/20"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-3 rounded-xl ${
                                darkMode
                                  ? "bg-gradient-to-r from-violet-500 to-violet-600"
                                  : "bg-gradient-to-r from-indigo-500 to-indigo-600"
                              }`}
                            >
                              <span className="text-xl">{mode.icon}</span>
                            </div>
                            <div>
                              <div className={`font-bold text-lg ${darkMode ? "text-gray-50" : "text-gray-900"}`}>
                                {mode.label}
                              </div>
                              <div className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                                {journey.startTime.toLocaleDateString()} at{" "}
                                {journey.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`rounded-full px-3 py-1 ${
                              darkMode ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {formatDuration(journey.duration)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "Distance", value: `${journey.distance.toFixed(2)} km`, highlight: false },
                            { label: "Avg Speed", value: `${Math.round(journey.avgSpeed)} km/h`, highlight: true },
                            { label: "Max Speed", value: `${Math.round(journey.maxSpeed)} km/h`, highlight: true },
                            { label: "Data Points", value: journey.path.length.toString(), highlight: false },
                          ].map((stat, index) => (
                            <div key={index} className="text-center">
                              <div
                                className={`text-lg font-bold ${
                                  stat.highlight
                                    ? darkMode
                                      ? "text-amber-300"
                                      : "text-yellow-400"
                                    : darkMode
                                      ? "text-gray-50"
                                      : "text-gray-900"
                                }`}
                              >
                                {stat.value}
                              </div>
                              <div className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                                {stat.label}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className={`mt-4 pt-4 border-t ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
                          <div className={`text-xs space-y-1 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${darkMode ? "bg-green-400" : "bg-emerald-500"}`}
                              ></div>
                              <span>From: {journey.startLocation.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${darkMode ? "bg-red-400" : "bg-red-500"}`}></div>
                              <span>To: {journey.endLocation.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Footer with Social Links */}
        <footer
          className={`mt-8 p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 ${
            darkMode ? "bg-slate-800/30 border border-slate-700/30" : "bg-white/30 border border-white/30"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            {/* SpeedSync Branding with Icon */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <SpeedSyncIcon size={32} darkMode={darkMode} animated={false} />
                <h3
                  className={`text-lg font-bold transition-all duration-300 ${
                    darkMode ? "text-violet-400" : "text-indigo-600"
                  }`}
                >
                  SpeedSync
                </h3>
              </div>
              <p className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                Built with ❤️ for speed enthusiasts
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/yourusername/speedsync"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                  darkMode
                    ? "bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white"
                    : "bg-gray-100/50 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                }`}
              >
                <Github className="w-5 h-5" />
              </a>

              <a
                href="https://yourportfolio.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                  darkMode
                    ? "bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white"
                    : "bg-gray-100/50 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                }`}
              >
                <User className="w-5 h-5" />
              </a>

              <a
                href="https://speedsync.app"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                  darkMode
                    ? "bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white"
                    : "bg-gray-100/50 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                }`}
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>

            {/* Copyright */}
            <div className={`text-xs text-center ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
              <p>© 2024 SpeedSync. All rights reserved.</p>
              <p className="mt-1">Real-time GPS tracking • OpenStreetMap integration</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Achievement Notification */}
      {showAchievements && achievements.length > 0 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div
            className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 ${
              darkMode ? "bg-slate-800/90 border-yellow-400/50" : "bg-white/90 border-yellow-500/50"
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className={`font-bold ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                Achievement Unlocked!
              </div>
              <div className={`text-sm ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                {achievementDefs[achievements[achievements.length - 1] as keyof typeof achievementDefs]?.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        
        
        
        
        
        
        @keyframes walk-bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        
        @keyframes run-bounce {
          0%, 100% { transform: translateY(0px) scaleX(1); }
          50% { transform: translateY(-3px) scaleX(1.1); }
        }
        
        @keyframes car-drive {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-1px); }
        }
        
        @keyframes train-chug {
          0%, 100% { transform: translateX(0px); }
          25% { transform: translateX(-1px); }
          75% { transform: translateX(1px); }
        }
        
        @keyframes flight-glide {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(1deg); }
        }
        
        @keyframes trail-fade {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.5); }
        }
        
        @keyframes particle-float {
          0% { opacity: 1; transform: translateY(0px); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        
        @keyframes smoke-rise {
          0% { opacity: 0.6; transform: translateY(0px) scale(0.8); }
          100% { opacity: 0; transform: translateY(-15px) scale(1.2); }
        }
        
        @keyframes steam-puff {
          0% { opacity: 0.7; transform: translateY(0px) scale(0.6); }
          100% { opacity: 0; transform: translateY(-20px) scale(1.4); }
        }
        
        @keyframes contrail-fade {
          0% { opacity: 0.8; width: 12px; }
          100% { opacity: 0; width: 4px; }
        }
      `}</style>
    </div>
  )
}
