"use client"
import { useEffect, useState } from "react"

interface ClockTime { h: number; m: number; s: number; ms: number }

function toRad(deg: number) {
  return (deg - 90) * (Math.PI / 180)
}

function handEnd(cx: number, cy: number, deg: number, length: number) {
  const r = toRad(deg)
  return { x: cx + length * Math.cos(r), y: cy + length * Math.sin(r) }
}

export function WatchClock({ size = 300 }: { size?: number }) {
  const [time, setTime] = useState<ClockTime>({ h: 10, m: 10, s: 30, ms: 0 })

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime({ h: now.getHours(), m: now.getMinutes(), s: now.getSeconds(), ms: now.getMilliseconds() })
    }
    tick()
    const id = setInterval(tick, 50)
    return () => clearInterval(id)
  }, [])

  const cx = size / 2
  const cy = size / 2
  const R = size * 0.43   // outer bezel
  const Ri = size * 0.38  // inner face

  // Smooth second with milliseconds
  const smoothS = time.s + time.ms / 1000
  const secDeg = smoothS * 6
  const minDeg = time.m * 6 + smoothS * 0.1
  const hourDeg = (time.h % 12) * 30 + time.m * 0.5

  const secTip = handEnd(cx, cy, secDeg, Ri * 0.88)
  const secTail = handEnd(cx, cy, secDeg + 180, Ri * 0.22)
  const minTip = handEnd(cx, cy, minDeg, Ri * 0.76)
  const minTail = handEnd(cx, cy, minDeg + 180, Ri * 0.14)
  const hourTip = handEnd(cx, cy, hourDeg, Ri * 0.52)
  const hourTail = handEnd(cx, cy, hourDeg + 180, Ri * 0.12)

  // Hour markers (12)
  const hourMarks = Array.from({ length: 12 }, (_, i) => {
    const deg = i * 30 - 90
    const rad = deg * (Math.PI / 180)
    return {
      x1: cx + (R - size * 0.06) * Math.cos(rad),
      y1: cy + (R - size * 0.06) * Math.sin(rad),
      x2: cx + R * Math.cos(rad),
      y2: cy + R * Math.sin(rad),
    }
  })

  // Minute markers (60, skip every 5th)
  const minMarks = Array.from({ length: 60 }, (_, i) => {
    if (i % 5 === 0) return null
    const deg = i * 6 - 90
    const rad = deg * (Math.PI / 180)
    return {
      x1: cx + (R - size * 0.025) * Math.cos(rad),
      y1: cy + (R - size * 0.025) * Math.sin(rad),
      x2: cx + R * Math.cos(rad),
      y2: cy + R * Math.sin(rad),
    }
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-hidden="true"
    >
      {/* Outer glow ring */}
      <circle cx={cx} cy={cy} r={R + size * 0.025} stroke="#2F3437" strokeWidth="0.4" strokeOpacity="0.12" />

      {/* Bezel */}
      <circle cx={cx} cy={cy} r={R} stroke="#2F3437" strokeWidth="1.5" strokeOpacity="0.4" />

      {/* Face */}
      <circle cx={cx} cy={cy} r={Ri} fill="#FFFFFF" stroke="#2F3437" strokeWidth="0.4" strokeOpacity="0.18" />

      {/* Minute marks */}
      {minMarks.map((m, i) =>
        m ? (
          <line
            key={i}
            x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
            stroke="#2F3437"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeOpacity="0.25"
          />
        ) : null
      )}

      {/* Hour marks */}
      {hourMarks.map((m, i) => (
        <line
          key={i}
          x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
          stroke="#2F3437"
          strokeWidth={i === 0 ? 2.5 : 1.8}
          strokeLinecap="round"
          strokeOpacity={i === 0 ? 0.5 : 0.35}
        />
      ))}

      {/* Hour hand */}
      <line
        x1={hourTail.x} y1={hourTail.y} x2={hourTip.x} y2={hourTip.y}
        stroke="#2F3437"
        strokeWidth={size * 0.022}
        strokeLinecap="round"
        strokeOpacity="0.45"
      />

      {/* Minute hand */}
      <line
        x1={minTail.x} y1={minTail.y} x2={minTip.x} y2={minTip.y}
        stroke="#2F3437"
        strokeWidth={size * 0.013}
        strokeLinecap="round"
        strokeOpacity="0.55"
      />

      {/* Second hand */}
      <line
        x1={secTail.x} y1={secTail.y} x2={secTip.x} y2={secTip.y}
        stroke="#2F3437"
        strokeWidth={size * 0.006}
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
      {/* Second hand tail accent dot */}
      <circle cx={secTail.x} cy={secTail.y} r={size * 0.012} fill="#2F3437" opacity="0.5" />

      {/* Center cap */}
      <circle cx={cx} cy={cy} r={size * 0.022} fill="#2F3437" opacity="0.55" />
      <circle cx={cx} cy={cy} r={size * 0.01} fill="#FFFFFF" />

      {/* Brand text on dial */}
      <text
        x={cx}
        y={cy + Ri * 0.52}
        textAnchor="middle"
        fill="#2F3437"
        fontSize={size * 0.048}
        fontFamily="Georgia, serif"
        letterSpacing="2"
        opacity="0.35"
      >
        NTTW
      </text>
    </svg>
  )
}
