import React from 'react'

type Props = {
  value: number // 0..1
  size?: number
}

export default function CircularProgress({ value, size = 140 }: Props) {
  const normalized = Math.max(0, Math.min(1, value))
  const radius = 112
  const stroke = 18
  const circumference = 2 * Math.PI * radius
  const dash = circumference * normalized

  return (
    <svg
      className="hud-ring-svg"
      width={size}
      height={size}
      viewBox="0 0 260 260"
      role="img"
      aria-label={`${Math.round(normalized * 100)} percent complete`}
    >
      <defs>
        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="130" cy="130" r={radius} stroke="var(--ring-track)" strokeWidth={stroke} fill="none" />
      <circle
        cx="130"
        cy="130"
        r={radius}
        stroke="var(--ring-glow)"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform="rotate(-90 130 130)"
        opacity="0.52"
        filter="url(#softGlow)"
      />
      <circle
        cx="130"
        cy="130"
        r={radius}
        stroke="var(--ring-ink)"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform="rotate(-90 130 130)"
      />
    </svg>
  )
}
