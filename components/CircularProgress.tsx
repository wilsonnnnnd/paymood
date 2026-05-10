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
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={radius} stroke="#e6e6e6" strokeWidth={stroke} fill="none" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke="#0ea5e9"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="62" textAnchor="middle" fontSize="18" fill="#0f172a">{Math.round(normalized * 100)}%</text>
    </svg>
  )
}
