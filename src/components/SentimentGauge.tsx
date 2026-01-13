import { useEffect, useId, useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { getSentimentDisplay, type SentimentLevel } from '../services/sentimentAnalysis'

type SentimentGaugeProps = {
  sentiment: {
    level: SentimentLevel
    score: number // -100..100
  }
  size?: number
  isBlinking?: boolean
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

export function SentimentGauge({ sentiment, size = 200, isBlinking = false }: SentimentGaugeProps) {
  const display = getSentimentDisplay(sentiment.level)
  const uid = useId().replace(/:/g, '')
  const [isNeedleWiggling, setIsNeedleWiggling] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setIsNeedleWiggling(true), 3000)
    return () => window.clearTimeout(t)
  }, [])

  const dims = useMemo(() => {
    const w = size
    const h = Math.round(size * 0.62)
    const cx = w / 2
    const cy = h * 0.95
    const r = Math.min(w, h) * 0.75
    const arcWidth = Math.max(10, Math.round(size * 0.06))
    return { w, h, cx, cy, r, arcWidth }
  }, [size])

  const scoreClamped = Math.max(-100, Math.min(100, sentiment.score))
  // Needle rotation (deg): -100 => -180 (left), 0 => -90 (up), 100 => 0 (right)
  const needleRotation = (scoreClamped / 100) * 90 - 90

  const baseArc = describeArc(dims.cx, dims.cy, dims.r, 180, 0)
  const arcGradientId = `sentimentArc-${uid}`

  return (
    <div className="sentiment-gauge-container">
      <svg
        className={`sentiment-gauge-svg ${isBlinking ? 'blinking' : ''}`}
        width={dims.w}
        height={dims.h}
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        role="img"
        aria-label={`Sentiment gauge: ${display.label} (${sentiment.score})`}
      >
        <defs>
          <linearGradient id={arcGradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="30%" stopColor="#f97316" />
            <stop offset="55%" stopColor="#fbbf24" />
            <stop offset="75%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path
          d={baseArc}
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={dims.arcWidth}
          fill="none"
          strokeLinecap="round"
        />

        <path
          d={baseArc}
          stroke={`url(#${arcGradientId})`}
          strokeWidth={dims.arcWidth}
          fill="none"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.15))' }}
        />

        {/* Needle */}
        <g
          className="gauge-needle-base"
          style={{
            transformOrigin: `${dims.cx}px ${dims.cy}px`,
            transform: `rotate(${needleRotation}deg)`,
            transition: 'transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          <g
            className={`gauge-needle ${isNeedleWiggling ? 'wiggling' : ''}`}
            style={{ transformOrigin: `${dims.cx}px ${dims.cy}px` }}
          >
            <line
              x1={dims.cx}
              y1={dims.cy}
              x2={dims.cx + dims.r * 0.82}
              y2={dims.cy}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle cx={dims.cx} cy={dims.cy} r={6} fill="rgba(255,255,255,0.9)" />
            <circle cx={dims.cx} cy={dims.cy} r={3} fill="rgba(0,0,0,0.35)" />
          </g>
        </g>
      </svg>

      <div className="sentiment-gauge-labels" aria-hidden="true">
        <div className="sentiment-label-item">
          <span>Bearish</span>
          <Info className="info-icon" size={12} />
        </div>
        <div className="sentiment-label-item">
          <span>Bullish</span>
        </div>
      </div>
    </div>
  )
}

