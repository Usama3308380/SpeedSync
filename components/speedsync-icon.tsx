"use client"

import { useState } from "react"

interface SpeedSyncIconProps {
  size?: number
  darkMode?: boolean
  animated?: boolean
  className?: string
}

export function SpeedSyncIcon({ size = 120, darkMode = false, animated = true, className = "" }: SpeedSyncIconProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className={`transition-all duration-500 ${animated ? "hover:scale-110" : ""} ${
          isHovered && animated ? "drop-shadow-2xl" : "drop-shadow-lg"
        }`}
      >
        {/* Background Circle with Gradient */}
        <defs>
          {/* Main gradient for background */}
          <radialGradient id="bgGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor={darkMode ? "#1e293b" : "#ffffff"} />
            <stop offset="100%" stopColor={darkMode ? "#0f172a" : "#f1f5f9"} />
          </radialGradient>

          {/* Speed ring gradient */}
          <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={darkMode ? "#34d399" : "#10b981"} />
            <stop offset="30%" stopColor={darkMode ? "#8b5cf6" : "#6366f1"} />
            <stop offset="70%" stopColor={darkMode ? "#fcd34d" : "#facc15"} />
            <stop offset="100%" stopColor={darkMode ? "#f87171" : "#ef4444"} />
          </linearGradient>

          {/* Needle gradient */}
          <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={darkMode ? "#8b5cf6" : "#6366f1"} />
            <stop offset="100%" stopColor={darkMode ? "#a855f7" : "#8b5cf6"} />
          </linearGradient>

          {/* Glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shadow filter */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="8"
              floodColor={darkMode ? "#000000" : "#64748b"}
              floodOpacity="0.3"
            />
          </filter>
        </defs>

        {/* Main background circle */}
        <circle
          cx="60"
          cy="60"
          r="56"
          fill="url(#bgGradient)"
          stroke={darkMode ? "#475569" : "#e2e8f0"}
          strokeWidth="2"
          filter="url(#shadow)"
        />

        {/* Outer speed ring */}
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke={darkMode ? "#334155" : "#e2e8f0"}
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Active speed ring (animated) */}
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke="url(#speedGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="200 301"
          strokeDashoffset="0"
          transform="rotate(-90 60 60)"
          className={animated ? "animate-pulse" : ""}
          style={{
            animation: animated ? "rotate-ring 3s linear infinite" : "none",
          }}
        />

        {/* Speed markings */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = i * 30 - 90
          const isMainMark = i % 3 === 0
          const x1 = 60 + (isMainMark ? 35 : 38) * Math.cos((angle * Math.PI) / 180)
          const y1 = 60 + (isMainMark ? 35 : 38) * Math.sin((angle * Math.PI) / 180)
          const x2 = 60 + (isMainMark ? 30 : 33) * Math.cos((angle * Math.PI) / 180)
          const y2 = 60 + (isMainMark ? 30 : 33) * Math.sin((angle * Math.PI) / 180)

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={darkMode ? "#64748b" : "#94a3b8"}
              strokeWidth={isMainMark ? "2" : "1"}
              strokeLinecap="round"
            />
          )
        })}

        {/* Center hub */}
        <circle
          cx="60"
          cy="60"
          r="8"
          fill={darkMode ? "#1e293b" : "#ffffff"}
          stroke={darkMode ? "#475569" : "#cbd5e1"}
          strokeWidth="2"
        />

        {/* Speed needle */}
        <g transform="rotate(45 60 60)">
          <path
            d="M 60 60 L 60 25 L 62 27 L 60 20 L 58 27 Z"
            fill="url(#needleGradient)"
            filter={animated ? "url(#glow)" : ""}
            className={animated ? "animate-pulse" : ""}
          />
        </g>

        {/* Center dot */}
        <circle
          cx="60"
          cy="60"
          r="3"
          fill={darkMode ? "#8b5cf6" : "#6366f1"}
          className={animated ? "animate-pulse" : ""}
        />

        {/* Speed indicators (small dots) */}
        {Array.from({ length: 3 }, (_, i) => (
          <circle
            key={i}
            cx={75 + i * 8}
            cy="95"
            r="2"
            fill={darkMode ? "#34d399" : "#10b981"}
            className={animated ? "animate-pulse" : ""}
            style={{
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}

        {/* SpeedSync text (curved) */}
        <defs>
          <path id="textCircle" d="M 20,60 A 40,40 0 1,1 100,60" />
        </defs>
        <text fontSize="8" fontWeight="bold" fill={darkMode ? "#a855f7" : "#6366f1"} textAnchor="middle">
          <textPath href="#textCircle" startOffset="50%">
            SPEEDSYNC
          </textPath>
        </text>

        {/* Digital display effect */}
        <rect
          x="45"
          y="70"
          width="30"
          height="12"
          rx="2"
          fill={darkMode ? "#0f172a" : "#1e293b"}
          stroke={darkMode ? "#475569" : "#64748b"}
          strokeWidth="1"
          opacity="0.8"
        />

        {/* Speed number */}
        <text
          x="60"
          y="79"
          textAnchor="middle"
          fontSize="8"
          fontWeight="bold"
          fill={darkMode ? "#34d399" : "#10b981"}
          className={animated ? "animate-pulse" : ""}
        >
          {animated && isHovered ? "120" : "85"}
        </text>

        {/* Decorative elements */}
        <g opacity="0.6">
          {/* Top accent */}
          <path
            d="M 50 15 Q 60 10 70 15"
            stroke={darkMode ? "#8b5cf6" : "#6366f1"}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Bottom accent */}
          <path
            d="M 50 105 Q 60 110 70 105"
            stroke={darkMode ? "#8b5cf6" : "#6366f1"}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Animated particles (when hovered) */}
        {animated && isHovered && (
          <g>
            {Array.from({ length: 6 }, (_, i) => (
              <circle
                key={i}
                cx={60 + 25 * Math.cos((i * 60 * Math.PI) / 180)}
                cy={60 + 25 * Math.sin((i * 60 * Math.PI) / 180)}
                r="1"
                fill={darkMode ? "#fcd34d" : "#facc15"}
                opacity="0.8"
                className="animate-ping"
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </g>
        )}
      </svg>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes rotate-ring {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -301; }
        }
      `}</style>
    </div>
  )
}
