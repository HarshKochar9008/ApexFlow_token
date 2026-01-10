import { useEffect, useMemo, useState } from 'react'
import { Brush, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import { X, Lock, TrendingUp } from 'lucide-react'
import { type TrendingStory } from '../services/sentimentAnalysis'
import { SentimentGauge } from './SentimentGauge'
import { SocialVolumePriceChart } from './SocialVolumePriceChart'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

type InteractiveSentimentDashboardProps = {
  story: TrendingStory
  onClose: () => void
  isUnlocked: boolean
}

type Timeframe = '4h' | '1D' | '7D'
type Asset = 'BTC' | 'ETH' | 'SOL'

type PlatformKey = 'x' | 'reddit' | 'telegram' | 'chan4' | 'bitcointalk' | 'farcaster'

const PLATFORM_DEFS: Array<{ key: PlatformKey; name: string }> = [
  { key: 'x', name: 'Twitter / X' },
  { key: 'reddit', name: 'Reddit' },
  { key: 'telegram', name: 'Telegram' },
  { key: 'chan4', name: '4chan' },
  { key: 'bitcointalk', name: 'Bitcointalk' },
  { key: 'farcaster', name: 'Farcaster' },
]

const PLATFORM_WEIGHTS: Record<PlatformKey, number> = {
  x: 0.42,
  reddit: 0.19,
  telegram: 0.16,
  chan4: 0.08,
  bitcointalk: 0.07,
  farcaster: 0.08,
}

type DashboardPoint = {
  label: string
  price: number
  sentiment: number // -100..100
  volumes: Record<PlatformKey, number>
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function scoreToLevel(score: number): TrendingStory['sentiment']['level'] {
  if (score >= 65) return 'very_bullish'
  if (score >= 25) return 'bullish'
  if (score <= -65) return 'very_bearish'
  if (score <= -25) return 'bearish'
  return 'neutral'
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStringToSeed(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function resampleLinear(values: number[], newLen: number) {
  if (newLen <= 1) return [values[0] ?? 0]
  if (values.length === 0) return new Array(newLen).fill(0)
  if (values.length === 1) return new Array(newLen).fill(values[0] ?? 0)

  const out: number[] = []
  const maxIdx = values.length - 1
  for (let i = 0; i < newLen; i++) {
    const t = (i / (newLen - 1)) * maxIdx
    const i0 = Math.floor(t)
    const i1 = Math.min(maxIdx, i0 + 1)
    const frac = t - i0
    out.push((values[i0] ?? 0) * (1 - frac) + (values[i1] ?? 0) * frac)
  }
  return out
}

function formatTimeLabel(d: Date, timeframe: Timeframe) {
  if (timeframe === '7D') return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function buildInitialSeries({
  seedKey,
  timeframe,
  asset,
  story,
}: {
  seedKey: string
  timeframe: Timeframe
  asset: Asset
  story: TrendingStory
}): DashboardPoint[] {
  const seed = hashStringToSeed(seedKey)
  const rand = mulberry32(seed)

  const len = timeframe === '4h' ? 48 : timeframe === '1D' ? 24 : 7
  const now = new Date()
  const stepMs = timeframe === '4h' ? 5 * 60 * 1000 : timeframe === '1D' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000

  const basePriceMap: Record<Asset, number> = { BTC: 43000, ETH: 2400, SOL: 110 }
  const basePrice = basePriceMap[asset] * (1 + story.sentiment.score / 1500)

  const totalVolume = resampleLinear(story.socialVolume.data, len).map((v) => Math.max(0, v))

  let price = basePrice
  let sentiment = clamp(story.sentiment.score + (rand() - 0.5) * 10, -100, 100)

  const points: DashboardPoint[] = []
  for (let i = 0; i < len; i++) {
    const t = new Date(now.getTime() - stepMs * (len - 1 - i))
    const v = totalVolume[i] ?? 0

    const volumeImpulse = (v / (Math.max(...totalVolume) || 1)) * 0.9 + 0.1
    const drift = (rand() - 0.5) * basePrice * 0.0012 * volumeImpulse
    const bias = (sentiment / 100) * basePrice * 0.0009
    price = Math.max(0.01, price + drift + bias)

    const sentimentDrift = (rand() - 0.5) * 8 + (v - (totalVolume[Math.max(0, i - 1)] ?? v)) * 0.01
    sentiment = clamp(sentiment + sentimentDrift, -100, 100)

    const volumes = PLATFORM_DEFS.reduce((acc, p) => {
      const w = PLATFORM_WEIGHTS[p.key]
      const noise = 0.82 + rand() * 0.36
      acc[p.key] = Math.max(0, Math.round(v * w * noise))
      return acc
    }, {} as Record<PlatformKey, number>)

    points.push({
      label: formatTimeLabel(t, timeframe),
      price: Math.round(price * 100) / 100,
      sentiment: Math.round(sentiment),
      volumes,
    })
  }

  return points
}

function nextPoint(prev: DashboardPoint, timeframe: Timeframe) {
  const seed = hashStringToSeed(`${prev.label}:${prev.price}:${prev.sentiment}`)
  const rand = mulberry32(seed)

  const stepMs = timeframe === '4h' ? 5 * 60 * 1000 : timeframe === '1D' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  const now = new Date(Date.now() + stepMs)

  const total = Object.values(prev.volumes).reduce((a, b) => a + b, 0)
  const totalNext = Math.max(0, Math.round(total * (0.92 + rand() * 0.22)))

  const priceImpulse = clamp((rand() - 0.5) * 0.012 + (prev.sentiment / 100) * 0.003, -0.02, 0.02)
  const priceNext = Math.max(0.01, prev.price * (1 + priceImpulse))

  const sentimentNext = clamp(prev.sentiment + (rand() - 0.5) * 10 + (totalNext - total) * 0.002, -100, 100)

  const volumes = PLATFORM_DEFS.reduce((acc, p) => {
    const w = PLATFORM_WEIGHTS[p.key]
    const noise = 0.84 + rand() * 0.32
    acc[p.key] = Math.max(0, Math.round(totalNext * w * noise))
    return acc
  }, {} as Record<PlatformKey, number>)

  return {
    label: formatTimeLabel(now, timeframe),
    price: Math.round(priceNext * 100) / 100,
    sentiment: Math.round(sentimentNext),
    volumes,
  } satisfies DashboardPoint
}

export function InteractiveSentimentDashboard({ story, onClose, isUnlocked }: InteractiveSentimentDashboardProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('7D')
  const [asset, setAsset] = useState<Asset>('BTC')
  const [showSentimentOverlay, setShowSentimentOverlay] = useState(true)
  const [isBlinking, setIsBlinking] = useState(false)

  const [series, setSeries] = useState<DashboardPoint[]>(() =>
    buildInitialSeries({ seedKey: `${story.id}:7D:BTC`, timeframe: '7D', asset: 'BTC', story })
  )

  useEffect(() => {
    setSeries(buildInitialSeries({ seedKey: `${story.id}:${timeframe}:${asset}`, timeframe, asset, story }))
  }, [asset, story, timeframe])

  useEffect(() => {
    const interval = setInterval(() => {
      setSeries((prev) => {
        if (prev.length === 0) return prev
        const n = nextPoint(prev[prev.length - 1], timeframe)
        return [...prev.slice(1), n]
      })

      setIsBlinking(true)
      window.setTimeout(() => setIsBlinking(false), 650)
    }, 6500)

    return () => clearInterval(interval)
  }, [timeframe])

  const latest = series[series.length - 1]
  const sentimentScore = latest?.sentiment ?? story.sentiment.score
  const sentimentLevel = scoreToLevel(sentimentScore)

  const priceChartData = useMemo(
    () => series.map((p) => ({ label: p.label, price: p.price, sentiment: p.sentiment })),
    [series]
  )

  const syncId = 'sentiment-dashboard-sync'

  const priceConfig: ChartConfig = {
    price: { label: `${asset} Price`, color: 'rgba(59, 130, 246, 0.95)' },
    sentiment: { label: 'Sentiment', color: 'rgba(200, 240, 46, 0.95)' },
  }

  return (
    <>
      <div className="dashboard-overlay" onClick={onClose} />
      <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-header">
          <div>
            <h2 className="dashboard-title">{story.title}</h2>
            <p className="dashboard-subtitle">Interactive Sentiment Dashboard</p>
          </div>
          <button className="dashboard-close-btn" onClick={onClose} aria-label="Close dashboard">
            <X size={18} />
          </button>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title">Price Chart</h3>
              <div className="dashboard-controls">
                <div className="timeframe-toggle" role="tablist" aria-label="Timeframe">
                  {(['4h', '1D', '7D'] as Timeframe[]).map((tf) => (
                    <button
                      key={tf}
                      className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
                      onClick={() => setTimeframe(tf)}
                      type="button"
                      role="tab"
                      aria-selected={timeframe === tf}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <select className="asset-select" value={asset} onChange={(e) => setAsset(e.target.value as Asset)}>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                </select>

                <label className="overlay-toggle">
                  <input
                    type="checkbox"
                    checked={showSentimentOverlay}
                    onChange={(e) => setShowSentimentOverlay(e.target.checked)}
                  />
                  Overlay sentiment
                </label>
              </div>
            </div>
            <div className="price-chart-wrapper">
              <div className={`price-chart-container ${!isUnlocked ? 'locked' : ''}`}>
                <div className="price-chart-toprow">
                  <div className="price-chart-note">{asset} price · hover, zoom, brush</div>
                  <div className="dashboard-meter">
                    <div className="dashboard-meter-kicker">LIVE SENTIMENT</div>
                    <SentimentGauge
                      sentiment={{ level: sentimentLevel, score: sentimentScore }}
                      size={140}
                      isBlinking={isBlinking}
                    />
                  </div>
                </div>

                <ChartContainer config={priceConfig} className="w-full" style={{ height: 260 }}>
                  <ComposedChart data={priceChartData} margin={{ left: 10, right: 10, top: 8, bottom: 0 }} syncId={syncId}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} />
                    <YAxis yAxisId="price" orientation="right" hide domain={['dataMin', 'dataMax']} />
                    <YAxis yAxisId="sentiment" hide domain={[-100, 100]} />

                    <ChartTooltip cursor content={<ChartTooltipContent labelKey="label" indicator="line" />} />

                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="price"
                      stroke="var(--color-price)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3 }}
                    />

                    {showSentimentOverlay && (
                      <Line
                        yAxisId="sentiment"
                        type="monotone"
                        dataKey="sentiment"
                        stroke="var(--color-sentiment)"
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="6 4"
                        opacity={0.9}
                      />
                    )}

                    <Brush dataKey="label" height={22} stroke="rgba(200, 240, 46, 0.6)" travellerWidth={10} />
                  </ComposedChart>
                </ChartContainer>
              </div>

              {!isUnlocked && (
                <div className="locked-overlay" aria-hidden="true">
                  <Lock size={22} />
                  <p>Stake XFLOW for full data</p>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title">Social Volume by Platform</h3>
            </div>

            <div className="social-platforms-wrapper">
              <div className={`social-platforms-grid ${!isUnlocked ? 'locked' : ''}`}>
                {PLATFORM_DEFS.map((p) => {
                  const platformData = series.map((pt) => ({
                    label: pt.label,
                    volume: pt.volumes[p.key],
                    price: pt.price,
                  }))

                  return (
                    <div key={p.key} className="platform-chart-card">
                      <div className="platform-chart-header">
                        <h4 className="platform-chart-title">{p.name}</h4>
                        {!isUnlocked && <Lock size={14} style={{ opacity: 0.6 }} />}
                      </div>
                      <SocialVolumePriceChart data={platformData} height={150} syncId={syncId} />
                    </div>
                  )
                })}
              </div>

              {!isUnlocked && (
                <div className="locked-overlay" aria-hidden="true">
                  <Lock size={22} />
                  <p>Stake XFLOW for full data</p>
                </div>
              )}
            </div>
          </div>

          {!isUnlocked && (
            <div className="staking-cta-section">
              <div className="staking-cta-content">
                <h3 className="staking-cta-title">Stake XFLOW for full data</h3>
                <p className="staking-cta-text">
                  Advanced sentiment, historical trends & predictive signals unlocked with staking.
                </p>
                <button className="staking-cta-button" onClick={() => alert('Staking flow coming soon')}>
                  <TrendingUp size={16} style={{ marginRight: 8 }} />
                  Stake XFLOW to Unlock Full Sentiment Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

