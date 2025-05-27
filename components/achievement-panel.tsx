"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface AchievementPanelProps {
  darkMode: boolean
  achievements: string[]
  onClose: () => void
}

const allAchievements: Achievement[] = [
  {
    id: "first_journey",
    name: "First Steps",
    description: "Complete your first journey",
    icon: "🚶",
    unlocked: false,
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Reach 100+ km/h",
    icon: "🏎️",
    unlocked: false,
  },
  {
    id: "highway_cruiser",
    name: "Highway Cruiser",
    description: "Reach 50+ km/h",
    icon: "🛣️",
    unlocked: false,
  },
  {
    id: "century_rider",
    name: "Century Rider",
    description: "Travel 100+ km in one journey",
    icon: "🚴",
    unlocked: false,
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Travel 10+ km",
    icon: "🗺️",
    unlocked: false,
  },
  {
    id: "endurance_master",
    name: "Endurance Master",
    description: "Journey for over 1 hour",
    icon: "⏱️",
    unlocked: false,
  },
  {
    id: "altitude_climber",
    name: "Altitude Climber",
    description: "Gain 500m elevation",
    icon: "🏔️",
    unlocked: false,
  },
  {
    id: "weather_warrior",
    name: "Weather Warrior",
    description: "Track in 5 different weather conditions",
    icon: "🌦️",
    unlocked: false,
  },
  {
    id: "night_rider",
    name: "Night Rider",
    description: "Complete a journey after sunset",
    icon: "🌙",
    unlocked: false,
  },
  {
    id: "multi_modal",
    name: "Multi-Modal Master",
    description: "Use all transport modes",
    icon: "🚁",
    unlocked: false,
  },
]

export function AchievementPanel({ darkMode, achievements, onClose }: AchievementPanelProps) {
  const achievementsWithStatus = allAchievements.map((achievement) => ({
    ...achievement,
    unlocked: achievements.includes(achievement.id),
  }))

  const unlockedCount = achievementsWithStatus.filter((a) => a.unlocked).length
  const totalCount = achievementsWithStatus.length

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? "text-gray-50" : "text-gray-900"}`}>Achievements</h2>
          <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            {unlockedCount} of {totalCount} unlocked
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className={`rounded-full transition-all duration-300 ${
            darkMode
              ? "border-slate-600 text-slate-300 hover:bg-slate-700"
              : "border-gray-300 text-gray-700 hover:bg-white"
          }`}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className={`h-3 rounded-full overflow-hidden ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}>
          <div
            className={`h-full transition-all duration-500 ${
              darkMode
                ? "bg-gradient-to-r from-violet-500 to-purple-500"
                : "bg-gradient-to-r from-indigo-500 to-purple-500"
            }`}
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
        <div className={`text-xs mt-2 text-center ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
          {Math.round((unlockedCount / totalCount) * 100)}% Complete
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="grid grid-cols-1 gap-4">
          {achievementsWithStatus.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-2xl transition-all duration-300 ${
                achievement.unlocked
                  ? darkMode
                    ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30"
                    : "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30"
                  : darkMode
                    ? "bg-slate-800/50 border border-slate-700/50"
                    : "bg-white/70 border border-white/20"
              } backdrop-blur-xl shadow-lg`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`text-3xl p-3 rounded-xl ${
                    achievement.unlocked
                      ? darkMode
                        ? "bg-violet-500/30"
                        : "bg-indigo-500/30"
                      : darkMode
                        ? "bg-slate-700/50 grayscale"
                        : "bg-gray-200/50 grayscale"
                  }`}
                >
                  {achievement.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={`font-bold ${
                        achievement.unlocked
                          ? darkMode
                            ? "text-violet-300"
                            : "text-indigo-700"
                          : darkMode
                            ? "text-slate-400"
                            : "text-gray-500"
                      }`}
                    >
                      {achievement.name}
                    </h3>
                    {achievement.unlocked && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          darkMode ? "bg-violet-500/20 text-violet-300" : "bg-indigo-500/20 text-indigo-700"
                        }`}
                      >
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  <p
                    className={`text-sm ${
                      achievement.unlocked
                        ? darkMode
                          ? "text-slate-300"
                          : "text-gray-700"
                        : darkMode
                          ? "text-slate-500"
                          : "text-gray-400"
                    }`}
                  >
                    {achievement.description}
                  </p>

                  {achievement.progress !== undefined && achievement.maxProgress && (
                    <div className="mt-2">
                      <div className={`h-2 rounded-full overflow-hidden ${darkMode ? "bg-slate-600" : "bg-gray-300"}`}>
                        <div
                          className={`h-full transition-all duration-300 ${
                            darkMode ? "bg-violet-400" : "bg-indigo-500"
                          }`}
                          style={{
                            width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                        {achievement.progress} / {achievement.maxProgress}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
