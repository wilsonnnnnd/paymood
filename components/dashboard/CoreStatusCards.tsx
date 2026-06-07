import React from 'react'
import StatusMetricCard from './StatusMetricCard'

export type CoreStatusCard = {
  label: string
  value: React.ReactNode
  detail?: React.ReactNode
  metaLabel?: React.ReactNode
  metaValue?: React.ReactNode
  emphasis?: boolean
}

export default function CoreStatusCards({ cards }: { cards: CoreStatusCard[] }) {
  return (
    <section className="hud-core-status" aria-label="核心状态">
      {cards.map((card) => (
        <StatusMetricCard
          key={card.label}
          label={card.label}
          value={card.value}
          detail={card.detail}
          metaLabel={card.metaLabel}
          metaValue={card.metaValue}
          emphasis={card.emphasis}
        />
      ))}
    </section>
  )
}
