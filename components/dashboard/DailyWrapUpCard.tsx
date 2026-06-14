import React from 'react'

export default function DailyWrapUpCard({
  earned,
  workDuration,
  percent,
  cycleEarned,
  paydayCountdownLabel,
}: {
  earned: string
  workDuration: string
  percent: number
  cycleEarned?: string
  paydayCountdownLabel?: string
}) {
  return (
    <section className="hud-wrap-up-card" aria-label="今日收工总结">
      <div className="hud-state-orbit hud-state-orbit--wrap" aria-hidden="true">
        <span />
      </div>
      <div className="hud-wrap-up-copy">
        <span className="hud-wrap-up-kicker">今天已收工</span>
        <h2>今天收工啦</h2>
        <p>{paydayCountdownLabel ?? '明天继续。'}</p>
      </div>

      <div className="hud-wrap-up-metrics" aria-label="今日总结">
        <div>
          <span>今日收入</span>
          <strong>{earned}</strong>
        </div>
        <div>
          <span>工作时长</span>
          <strong>{workDuration}</strong>
        </div>
        <div>
          <span>今日完成度</span>
          <strong>{percent}%</strong>
        </div>
        {cycleEarned ? (
          <div>
            <span>本周期已累计</span>
            <strong>{cycleEarned}</strong>
          </div>
        ) : null}
      </div>
    </section>
  )
}
