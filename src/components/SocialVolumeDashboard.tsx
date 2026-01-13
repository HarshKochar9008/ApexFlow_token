import { useEffect, useRef, useState, useMemo } from 'react'
import { Share2, Link2, Settings, Eye, EyeOff, X, Calendar } from 'lucide-react'
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

type SocialVolumeDashboardProps = {
  isUnlocked?: boolean
  onClose?: () => void
}

// Generate mock data for the chart
function generateChartData() {
  const data = []
  const startDate = new Date('2025-10-12')
  const endDate = new Date('2026-01-13')
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  let basePrice = 43000
  let baseVolume = 200
  
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // Format date as "12 Oct 25"
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = String(date.getFullYear()).slice(-2)
    const label = `${day} ${month} ${year}`
    
    // Simulate price fluctuations
    basePrice += (Math.random() - 0.5) * 2000
    basePrice = Math.max(80000, Math.min(95000, basePrice))
    
    // Simulate volume spikes
    baseVolume = Math.max(0, baseVolume + (Math.random() - 0.4) * 100)
    const volume = Math.round(Math.max(0, baseVolume + Math.random() * 200))
    
    data.push({
      label,
      date: date.getTime(),
      price: Math.round(basePrice),
      volume: volume,
    })
  }
  
  return data
}

export function SocialVolumeDashboard({ isUnlocked = false, onClose }: SocialVolumeDashboardProps) {
  const [timeframe, setTimeframe] = useState('4h')
  const [showSocialVolume, setShowSocialVolume] = useState(true)
  const [showBTCUSD, setShowBTCUSD] = useState(true)
  const [showSocialDominance, setShowSocialDominance] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(!isUnlocked)
  
  const chartData = useMemo(() => generateChartData(), [])

  // Format date range (13/10/25 - 13/01/26)
  const formatDateRange = () => {
    const start = new Date('2025-10-13')
    const end = new Date('2026-01-13')
    
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = String(date.getFullYear()).slice(-2)
      return `${day}/${month}/${year}`
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`
  }

  useEffect(() => {
    setShowUpgradeModal(!isUnlocked)
  }, [isUnlocked])

  const chartConfig: ChartConfig = {
    volume: {
      label: 'Social Volume',
      color: 'rgba(96, 165, 250, 0.7)', // Light blue for bars - matches image
    },
    price: {
      label: 'BTC / USD',
      color: 'rgba(16, 185, 129, 0.9)', // Green for line - matches image
    },
  }

  // Filter data to show only every Nth point for better display
  const displayedData = useMemo(() => {
    const step = Math.max(1, Math.floor(chartData.length / 50))
    return chartData.filter((_, index) => index % step === 0 || index === chartData.length - 1)
  }, [chartData])

  return (
    <>
      <div className="social-volume-dashboard-overlay" onClick={onClose} />
      <div className="social-volume-dashboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tradingview-style-container">
          {/* Header with title, legend items, and controls */}
          <div className="tradingview-header">
            <div className="tradingview-header-left">
              <h2 className="tradingview-title">Social Volume</h2>
              <div className="tradingview-legend-inline">
                <button
                  className={`tradingview-legend-item tradingview-legend-social-volume ${showSocialVolume ? 'active' : ''}`}
                  onClick={() => setShowSocialVolume(!showSocialVolume)}
                >
                  <span>Social Volume</span>
                  {showSocialVolume ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  className={`tradingview-legend-item tradingview-legend-btc ${showBTCUSD ? 'active' : ''}`}
                  onClick={() => setShowBTCUSD(!showBTCUSD)}
                >
                  <span>BTC / USD</span>
                  {showBTCUSD ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            </div>
            <div className="tradingview-header-right">
              <div className="tradingview-header-controls">
                <button
                  className={`tradingview-timeframe-btn ${timeframe === '4h' ? 'active' : ''}`}
                  onClick={() => setTimeframe('4h')}
                >
                  4h
                </button>
                <div className="tradingview-date-range">
                  <Calendar size={14} />
                  <span>{formatDateRange()}</span>
                </div>
                <button className="tradingview-asset-btn">
                  BTC / USD
                </button>
                <button className="tradingview-icon-btn" onClick={() => alert('Share')}>
                  <Share2 size={16} />
                </button>
                <button className="tradingview-icon-btn" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                  <Link2 size={16} />
                </button>
                <button className="tradingview-icon-btn" onClick={() => alert('Settings')}>
                  <Settings size={16} />
                </button>
              </div>
              <div className="tradingview-toggle-wrapper">
                <label className="tradingview-toggle">
                  <input
                    type="checkbox"
                    checked={showSocialDominance}
                    onChange={(e) => setShowSocialDominance(e.target.checked)}
                  />
                  <span className="toggle-switch" />
                  <span className="toggle-text">Social Dominance</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main chart area with upgrade modal overlay */}
          <div className="tradingview-main-content">
            <div className="tradingview-chart-area">
              <ChartContainer config={chartConfig} className="w-full" style={{ height: '600px' }}>
                <ComposedChart 
                  data={displayedData} 
                  margin={{ left: 20, right: 20, top: 30, bottom: 60 }}
                >
                  <CartesianGrid 
                    vertical={false} 
                    strokeDasharray="3 3" 
                    stroke="rgba(255, 255, 255, 0.05)" 
                  />
                  
                  <XAxis 
                    dataKey="label" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={16}
                    minTickGap={40}
                    tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 11, fontWeight: 400 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  
                  <YAxis 
                    yAxisId="volume" 
                    orientation="left"
                    tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => value.toString()}
                    domain={[0, 'dataMax']}
                    width={50}
                  />
                  
                  <YAxis 
                    yAxisId="price" 
                    orientation="right"
                    tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => {
                      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
                      return value.toString()
                    }}
                    domain={['dataMin', 'dataMax']}
                    width={60}
                  />

                  <ChartTooltip
                    cursor={{ stroke: 'rgba(255, 255, 255, 0.15)', strokeWidth: 1 }}
                    content={<ChartTooltipContent labelKey="label" indicator="dot" />}
                  />

                  {showSocialVolume && (
                    <Bar
                      yAxisId="volume"
                      dataKey="volume"
                      fill="rgba(96, 165, 250, 0.65)"
                      radius={[1, 1, 0, 0]}
                      maxBarSize={40}
                    />
                  )}

                  {showBTCUSD && (
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="price"
                      stroke="rgba(16, 185, 129, 1)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: 'rgba(16, 185, 129, 1)' }}
                    />
                  )}
                </ComposedChart>
              </ChartContainer>
              
              {!isUnlocked && (
                <div className="tradingview-watermark">Santiment</div>
              )}
            </div>
            
            {/* Upgrade modal on the right */}
            {!isUnlocked && showUpgradeModal && (
              <div className="tradingview-upgrade-panel">
                <div className="tradingview-upgrade-content">
                  <h3 className="tradingview-upgrade-title">Upgrade For Full Data</h3>
                  <p className="tradingview-upgrade-subtitle">Your plan has limited data period for:</p>
                  <ul className="tradingview-upgrade-list">
                    <li>Social Volume (14 Jan, 24 - 14 Dec, 25)</li>
                    <li>and many others</li>
                  </ul>
                  <p className="tradingview-upgrade-description">
                    To unlock the full potential of Santiment metrics you need to upgrade your account to PRO
                  </p>
                  <button className="tradingview-upgrade-btn" onClick={() => alert('Upgrade flow coming soon')}>
                    Upgrade
                  </button>
                  <button className="tradingview-hide-btn" onClick={() => setShowUpgradeModal(false)}>
                    Hide Pro Metrics
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

