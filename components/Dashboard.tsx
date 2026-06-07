'use client'
import React from 'react'
import Link from 'next/link'
import AdSenseSlot from './AdSenseSlot'
import ColorModeToggle from './ColorModeToggle'
import CoreStatusCards, { type CoreStatusCard } from './dashboard/CoreStatusCards'
import DailyWrapUpCard from './dashboard/DailyWrapUpCard'
import SecondaryStatsSection from './dashboard/SecondaryStatsSection'
import TodayEarningsHero from './dashboard/TodayEarningsHero'
import { useSettings } from '../hooks/useSettings'
import { useClock } from '../hooks/useClock'
import { calculateWorkEarnings, getNextWorkStart, getWorkWindowForNow } from '../lib/earnings'
import { getCurrentPayCycle } from '../lib/payCycle'
import { currencySymbols } from '../lib/settings'

function formatHM(seconds: number) {
  const totalMinutes = Math.max(0, Math.floor(seconds / 60))
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
}

function formatCountdown(seconds: number) {
  const totalMinutes = Math.max(0, Math.floor(seconds / 60))
  const days = Math.floor(totalMinutes / (24 * 60))
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) return `${days}天 ${String(hours).padStart(2, '0')}小时`
  if (hours > 0) return `${hours}小时 ${String(minutes).padStart(2, '0')}分钟`
  return `${minutes}分钟`
}

function formatDaysUntil(days: number) {
  if (days <= 0) return '今天'
  return `${days}天`
}

function currencyCodeToSymbol(code: string | undefined) {
  const normalized = (code ?? '').trim().toUpperCase()
  const key = normalized as keyof typeof currencySymbols
  if (key in currencySymbols) return currencySymbols[key]
  return '$'
}

function moodFor(now: Date, start: Date, end: Date) {
  if (now.getTime() < start.getTime()) return '准备开工。'
  if (now.getTime() >= end.getTime()) return '可以下班了。'

  const hour = now.getHours()
  if (hour >= 12 && hour < 14) return '午休中。'

  const weekday = now.getDay()
  switch (weekday) {
    case 1:
      return '慢慢进入状态。'
    case 2:
      return '稳一点。'
    case 3:
      return '周三。'
    case 4:
      return '快到周五了。'
    case 5:
      return '准备收工。'
    default:
      return '今天也在慢慢赚钱。'
  }
}

function liveStatusFor({
  isReady,
  isWorkDay,
  now,
  start,
  end,
  remainingSeconds,
}: {
  isReady: boolean
  isWorkDay: boolean
  now: Date
  start: Date
  end: Date
  remainingSeconds: number
}) {
  if (!isReady) return 'Warming up'
  if (!isWorkDay) return 'Off today'
  if (now.getTime() < start.getTime()) return `Before shift · starts at ${formatTime(start)}`
  if (now.getTime() >= end.getTime()) return '今天已收工'
  return `In shift · ${formatHM(remainingSeconds)} left`
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatWorkNodeDate(date: Date) {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${weekdays[date.getDay()]} ${date.getMonth() + 1}/${date.getDate()} ${formatTime(date)}`
}

function getPaydayStatusCard({
  now,
  paydayDayOfMonth,
  salaryAmount,
  salaryType,
  formatMoney,
  fallback,
}: {
  now: Date
  paydayDayOfMonth?: number
  salaryAmount: number
  salaryType: string
  formatMoney: (value: number) => string
  fallback: CoreStatusCard
}): CoreStatusCard {
  if (typeof paydayDayOfMonth !== 'number') return fallback

  const { nextPayday } = getCurrentPayCycle(now, paydayDayOfMonth)
  const localToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysUntilPayday = Math.max(
    0,
    Math.ceil((nextPayday.getTime() - localToday.getTime()) / (24 * 60 * 60 * 1000)),
  )

  const expectedAmount = salaryType === 'monthly' && salaryAmount > 0 ? formatMoney(salaryAmount) : null
  if (!expectedAmount) return fallback

  return {
    label: '下一次工资到账',
    value: formatDaysUntil(daysUntilPayday),
    metaLabel: '预计到账',
    metaValue: expectedAmount,
    emphasis: true,
  }
}

function getPayCycleProgress(now: Date, paydayDayOfMonth?: number) {
  if (typeof paydayDayOfMonth !== 'number') return null

  const { previousPayday: currentCycleStart, nextPayday: currentCycleEnd } = getCurrentPayCycle(now, paydayDayOfMonth)
  const cycleMs = currentCycleEnd.getTime() - currentCycleStart.getTime()
  if (!Number.isFinite(cycleMs) || cycleMs <= 0) return null

  const rawProgress = (now.getTime() - currentCycleStart.getTime()) / cycleMs
  const progress = Math.min(1, Math.max(0, rawProgress))
  return Math.round(progress * 100)
}

function CycleMetric({ label, value, format }: { label: string; value: number; format: Intl.NumberFormat }) {
  return (
    <div className="hud-metric hud-metric--cycle" tabIndex={0}>
      <span className="hud-metric-copy">
        <span className="hud-metric-label">累计收入</span>
        <span className="hud-metric-subtitle">{label}</span>
      </span>
      <span className="hud-metric-value">{format.format(value)}</span>
      <span className="hud-metric-tip" role="tooltip">
        根据你的薪资类型显示当前周期已赚金额；小时/日薪看今日，周薪看本周，双周薪看本双周，月薪看本月，年薪看今年。
      </span>
    </div>
  )
}

export default function Dashboard({
  adsenseEnabled = true,
  onNoFill,
}: {
  adsenseEnabled?: boolean
  onNoFill?: () => void
}) {
  const { settings, ready } = useSettings()
  const now = useClock(1000)
  const isReady = ready && now !== null
  const workDaysPerWeek = settings.workDays?.length ? settings.workDays.length : 5
  const hasPaySetup = ready ? settings.payLocked === true && settings.salaryAmount > 0 : true

  const today = now ?? new Date(0)
  const fallbackWindow = getWorkWindowForNow(today, settings.startTime, settings.endTime)
  const earnings = isReady
    ? calculateWorkEarnings(today, {
        startTime: settings.startTime,
        endTime: settings.endTime,
        breakMinutes: settings.breakMinutes,
        workDays: settings.workDays,
        salaryAmount: settings.salaryAmount,
        salaryType: settings.salaryType,
        opts: { workDaysPerWeek },
      })
    : {
        start: fallbackWindow.start,
        end: fallbackWindow.end,
        isWorkDay: true,
        progress: { progress: 0, elapsedSeconds: 0, remainingSeconds: 0, totalWorkSeconds: 0 },
        day: { earned: 0, hourly: 0 },
        earned: 0,
        hourly: 0,
        week: { earned: 0, hourly: 0 },
        month: { earned: 0, hourly: 0 },
        cycle: { label: '本月', earned: 0 },
        percent: 0,
        remainingSeconds: 0,
      }
  const { start, end, isWorkDay } = earnings
  const prog = earnings.progress
  const earned = earnings.earned
  const cycle = earnings.cycle
  const percent = earnings.percent
  const totalsFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })
  const mood = !hasPaySetup ? '先放一颗起点。' : isReady ? (isWorkDay ? moodFor(today, start, end) : '今天休息。') : '热身中…'
  const currencySymbol = currencyCodeToSymbol(settings.currency)
  const liveStatus = liveStatusFor({
    isReady,
    isWorkDay,
    now: today,
    start,
    end,
    remainingSeconds: prog.remainingSeconds,
  })
  const nextWorkStart = getNextWorkStart(today, {
    startTime: settings.startTime,
    endTime: settings.endTime,
    workDays: settings.workDays,
  })
  const moneyValue = (value: number) => `${currencySymbol}${totalsFormat.format(value)}`
  const todayRemainingEarned = earnings.hourly * (prog.remainingSeconds / 3600)
  const secondsUntilOffwork = Math.max(0, Math.floor((end.getTime() - today.getTime()) / 1000))
  const fallbackPaydayCard: CoreStatusCard = {
    label: '本周期收入',
    value: moneyValue(cycle.earned),
    detail: cycle.label,
    emphasis: true,
  }
  const paydayCard = getPaydayStatusCard({
    now: today,
    paydayDayOfMonth: settings.paydayDayOfMonth,
    salaryAmount: settings.salaryAmount,
    salaryType: settings.salaryType,
    formatMoney: moneyValue,
    fallback: fallbackPaydayCard,
  })
  const payCycleProgress = getPayCycleProgress(today, settings.paydayDayOfMonth)
  const isAfterWork = hasPaySetup && isWorkDay && today.getTime() >= end.getTime()
  const coreStatusCards: CoreStatusCard[] = [
    {
      label: '距离下班',
      value: today.getTime() >= end.getTime() ? '已下班' : formatCountdown(secondsUntilOffwork),
      detail: formatTime(end),
      emphasis: true,
    },
    {
      label: '今天还能赚',
      value: moneyValue(todayRemainingEarned),
      detail: '按剩余工作时间估算',
    },
    paydayCard,
  ]

  return (
    <section className={`hud-shell ${isWorkDay ? 'hud-shell--active' : 'hud-shell--rest'}`} aria-label="PayMood 仪表盘">
      <div className="hud-top-actions" aria-label="顶部操作">
        <ColorModeToggle />
        <Link className="hud-icon-button" href="/settings" aria-label="打开设置">
          <span aria-hidden="true">⚙</span>
        </Link>
      </div>
      <header className="hud-header">
        <div className="hud-title">PayMood</div>
        <div className="hud-subtitle" aria-label="域名">
          paymood.work
        </div>
        <div className="hud-mood" aria-label="状态">
          {mood}
        </div>
        <div className="hud-live-status" aria-label="工作状态">
          {hasPaySetup ? liveStatus : '需要设置'}
        </div>
        <div className="hud-progress-rail" aria-hidden="true">
          <span style={{ width: `${hasPaySetup && isWorkDay ? percent : 0}%` }} />
        </div>
      </header>

      {!hasPaySetup ? (
        <div className="hud-main hud-rest" aria-label="开始设置">
          <div className="hud-rest-panel hud-onboarding-panel">
            <div className="hud-state-orbit hud-state-orbit--setup" aria-hidden="true">
              <span />
            </div>
            <div className="hud-rest-title">先设置你的薪资。</div>
            <div className="hud-rest-sub">PayMood 会只在本机保存，用它计算今天的进度和已赚收入。</div>
            <Link className="hud-primary-link" href="/settings">
              开始设置
            </Link>
          </div>
        </div>
      ) : !isWorkDay ? (
        <div className="hud-main hud-rest" aria-label="休息日">
          <div className="hud-rest-panel">
            <div className="hud-state-orbit hud-state-orbit--rest" aria-hidden="true">
              <span />
            </div>
            <div className="hud-rest-title">今天就先休息。</div>
            <div className="hud-rest-sub">
              {nextWorkStart
                ? `下个工作节点：${formatWorkNodeDate(nextWorkStart.start)}`
                : '还没有找到下一个工作节点。'}
            </div>
            {nextWorkStart ? (
              <div className="hud-work-node" aria-label="下一个工作节点">
                <span>
                  <strong>{formatCountdown(nextWorkStart.secondsUntil)}</strong>
                  <small>距离开工</small>
                </span>
                <span>
                  <strong>{totalsFormat.format(cycle.earned)}</strong>
                  <small>{cycle.label}已累计</small>
                </span>
              </div>
            ) : null}
            <div className="hud-rest-status">{liveStatus}</div>
          </div>
          <section className="hud-metrics" aria-label="摘要">
            <div className="hud-metric">
              <span className="hud-metric-label">今日收入</span>
              <span className="hud-metric-value">{totalsFormat.format(earned)}</span>
            </div>
            <CycleMetric label={cycle.label} value={cycle.earned} format={totalsFormat} />
          </section>
        </div>
      ) : isAfterWork ? (
        <div className="hud-main hud-wrap-up" aria-label="今日收工">
          <DailyWrapUpCard
            earned={moneyValue(earned)}
            workDuration={formatCountdown(prog.totalWorkSeconds)}
            percent={percent}
          />
          <SecondaryStatsSection
            weekEarned={earnings.week.earned}
            cycleLabel={cycle.label}
            cycleEarned={cycle.earned}
            cycleProgress={payCycleProgress}
            format={totalsFormat}
          />
        </div>
      ) : (
        <div className="hud-main hud-main--workday">
          <TodayEarningsHero
            earned={earned}
            percent={percent}
            progress={prog.progress}
            currencySymbol={currencySymbol}
          />

          <CoreStatusCards cards={coreStatusCards} />
          <SecondaryStatsSection
            weekEarned={earnings.week.earned}
            cycleLabel={cycle.label}
            cycleEarned={cycle.earned}
            cycleProgress={payCycleProgress}
            format={totalsFormat}
          />
        </div>
      )}
      <section className="hud-info-panel" aria-label="关于 PayMood">
        <h2>PayMood 如何工作</h2>
        <p>
          PayMood 会把你的工作时间和薪资设置，转换成今天进度、剩余时间和预估已赚收入的安静视图。
        </p>
        <ul>
          <li>你的工作时间、货币、主题和薪资偏好会保存在本机浏览器存储中。</li>
          <li>PayMood 不需要账号、工资单上传、银行信息或雇主记录。</li>
          <li>PayMood 不是 payroll 软件、税务建议、财务建议，也不是正式工资记录。</li>
        </ul>
      </section>
      <footer className="hud-footnote" aria-label="Site information">
        <Link href="/about">关于</Link> <Link href="/privacy">隐私</Link> <Link href="/terms">条款</Link>{' '}
        <Link href="/contact">联系</Link>
      </footer>
      {adsenseEnabled ? <AdSenseSlot onNoFill={onNoFill} /> : null}
    </section>
  )
}
