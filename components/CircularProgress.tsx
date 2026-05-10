import React from 'react'

type Props = {
  value: number // 0..1
  size?: number
}

export default function CircularProgress({value, size = 140}: Props) {
  const radius = 54
  const stroke = 12
  const normalized = Math.max(0, Math.min(1, value))
  const circumference = 2 * Math.PI * radius
  const dash = circumference * normalized

  return (
    <svg className="progress-ring" width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`${Math.round(normalized * 100)} percent complete`}>
      <defs>
        <linearGradient id="progressGradient" x1="18" y1="18" x2="102" y2="102" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb923c" />
          <stop offset="0.52" stopColor="#facc15" />
          <stop offset="1" stopColor="#fb7185" />
        </linearGradient>
        <filter id="progressGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="60" cy="60" r={radius} stroke="rgba(120, 53, 15, 0.12)" strokeWidth={stroke} fill="none" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke="url(#progressGradient)"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform="rotate(-90 60 60)"
        filter="url(#progressGlow)"
      />
      <text x="60" y="57" textAnchor="middle" fontSize="20" fontWeight="800" fill="#78350f">{Math.round(normalized * 100)}%</text>
      <text x="60" y="73" textAnchor="middle" fontSize="7" letterSpacing="1.4" fill="#b45309">YAY</text>
    </svg>
  )
}
