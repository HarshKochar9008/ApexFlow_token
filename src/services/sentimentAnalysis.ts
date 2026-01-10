export type SentimentLevel = 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish'

export type PredictionType = 'bullish' | 'neutral' | 'bearish'

export type AIPrediction = {
  type: PredictionType
  message: string
  confidence: number // 0-100
}

export type TrendingStory = {
  id: string
  rank: number
  title: string
  socialVolume: {
    data: number[] // 7-day data points
    labels: string[] // Date labels
  }
  aiSummary: string
  fullSummary?: string
  aiPrediction?: AIPrediction // New: Direct market action insight
  sentiment: {
    level: SentimentLevel
    score: number // -100 to 100, where -100 is very bearish, 100 is very bullish
  }
  timestamp: number
  updatedAt: number
}

export async function getTrendingStories(): Promise<TrendingStory[]> {
  return generateMockStories()
}

function generateMockStories(): TrendingStory[] {
  // Helper function to generate volatile data with dramatic ups and downs
  const generateVolatileData = (base: number, volatility: number = 0.4): number[] => {
    const data: number[] = []
    let current = base * (0.7 + Math.random() * 0.6) // Start with some variation
    for (let i = 0; i < 7; i++) {
      // Create dramatic swings - alternating between larger positive and negative changes
      const swingFactor = i % 2 === 0 ? 1.2 : -0.8 // Alternate direction for more volatility
      const randomSwing = (Math.random() - 0.5) * 2 * volatility * base * 1.5
      const trend = i < 3 ? -0.05 : 0.1 // Slight upward trend overall
      current = Math.max(50, current + (randomSwing * swingFactor) + (trend * base))
      data.push(Math.round(current))
    }
    return data
  }

  const story1Data = generateVolatileData(200, 0.5)
  const story2Data = generateVolatileData(130, 0.45)
  const story3Data = generateVolatileData(120, 0.6)
  const story4Data = generateVolatileData(280, 0.35)
  const story5Data = generateVolatileData(145, 0.4)

  const stories: TrendingStory[] = [
    {
      id: '1',
      rank: 1,
      title: 'Trump Mortgage Stimulus',
      socialVolume: {
        data: story1Data,
        labels: ['3d ago', '2d ago', '1d ago', '12h ago', '6h ago', '3h ago', 'Now'],
      },
      aiSummary:
        'President Trump has directed the U.S. government to purchase $200 billion in mortgage bonds to lower mortgage rates and improve housing affordability. This move aims to reduce monthly payments for homeowners and stimulate the housing market...',
      fullSummary:
        'President Trump has directed the U.S. government to purchase $200 billion in mortgage bonds to lower mortgage rates and improve housing affordability. This move aims to reduce monthly payments for homeowners and stimulate the housing market. The announcement has sparked significant discussion across social media platforms, with many viewing it as a positive development for the economy and real estate sector.',
      sentiment: {
        level: 'bullish',
        score: 75,
      },
      aiPrediction: generateAIPrediction({ level: 'bullish', score: 75 }, story1Data),
      timestamp: Date.now() - 3600000, // 1 hour ago
      updatedAt: Date.now() - 180000, // 3 minutes ago
    },
    {
      id: '2',
      rank: 2,
      title: 'NFP Jobs Payrolls',
      socialVolume: {
        data: story2Data,
        labels: ['3d ago', '2d ago', '1d ago', '12h ago', '6h ago', '3h ago', 'Now'],
      },
      aiSummary:
        'The US added 50,000 jobs in December, missing the 60,000 estimate, while the unemployment rate fell to 4.4%, better than expected. Wage growth remained steady at 0.3% monthly and 3.8% yearly...',
      fullSummary:
        'The US added 50,000 jobs in December, missing the 60,000 estimate, while the unemployment rate fell to 4.4%, better than expected. Wage growth remained steady at 0.3% monthly and 3.8% yearly. Mixed signals from the labor market have created uncertainty, with some analysts viewing the data as positive for the economy while others express concern about job growth.',
      sentiment: {
        level: 'neutral',
        score: 15,
      },
      aiPrediction: generateAIPrediction({ level: 'neutral', score: 15 }, story2Data),
      timestamp: Date.now() - 7200000, // 2 hours ago
      updatedAt: Date.now() - 180000, // 3 minutes ago
    },
    {
      id: '3',
      rank: 3,
      title: "ZEC, AVICI Turmoil",
      socialVolume: {
        data: story3Data,
        labels: ['3d ago', '2d ago', '1d ago', '12h ago', '6h ago', '3h ago', 'Now'],
      },
      aiSummary:
        "Zcash's entire core development team resigned amid a governance dispute, causing a sharp 20-45% price drop and wiping out $1.6 billion in market cap. The departing devs plan to launch a new...",
      fullSummary:
        "Zcash's entire core development team resigned amid a governance dispute, causing a sharp 20-45% price drop and wiping out $1.6 billion in market cap. The departing devs plan to launch a new privacy-focused cryptocurrency. This development has created significant uncertainty in the privacy coin sector, with investors and community members expressing concern about the future of Zcash.",
      sentiment: {
        level: 'very_bearish',
        score: -85,
      },
      aiPrediction: generateAIPrediction({ level: 'very_bearish', score: -85 }, story3Data),
      timestamp: Date.now() - 5400000, // 1.5 hours ago
      updatedAt: Date.now() - 180000, // 3 minutes ago
    },
    {
      id: '4',
      rank: 4,
      title: 'Bitcoin ETF Approval Surge',
      socialVolume: {
        data: story4Data,
        labels: ['3d ago', '2d ago', '1d ago', '12h ago', '6h ago', '3h ago', 'Now'],
      },
      aiSummary:
        'Major institutional investors are showing increased interest in Bitcoin ETFs, with record inflows of $2.5 billion in the past week. Analysts predict this trend will continue as regulatory clarity improves...',
      fullSummary:
        'Major institutional investors are showing increased interest in Bitcoin ETFs, with record inflows of $2.5 billion in the past week. Analysts predict this trend will continue as regulatory clarity improves. The surge in institutional adoption has been met with positive sentiment across crypto communities.',
      sentiment: {
        level: 'very_bullish',
        score: 90,
      },
      aiPrediction: generateAIPrediction({ level: 'very_bullish', score: 90 }, story4Data),
      timestamp: Date.now() - 10800000, // 3 hours ago
      updatedAt: Date.now() - 180000, // 3 minutes ago
    },
    {
      id: '5',
      rank: 5,
      title: 'Ethereum Layer 2 Scaling Update',
      socialVolume: {
        data: story5Data,
        labels: ['3d ago', '2d ago', '1d ago', '12h ago', '6h ago', '3h ago', 'Now'],
      },
      aiSummary:
        "Ethereum's Layer 2 solutions have processed over 10 million transactions this week, demonstrating significant scalability improvements. Transaction fees have dropped by 40% compared to mainnet...",
      fullSummary:
        "Ethereum's Layer 2 solutions have processed over 10 million transactions this week, demonstrating significant scalability improvements. Transaction fees have dropped by 40% compared to mainnet. This development is being viewed positively by the Ethereum community as it addresses long-standing scalability concerns.",
      sentiment: {
        level: 'bullish',
        score: 65,
      },
      aiPrediction: generateAIPrediction({ level: 'bullish', score: 65 }, story5Data),
      timestamp: Date.now() - 14400000, // 4 hours ago
      updatedAt: Date.now() - 180000, // 3 minutes ago
    },
  ]

  return stories
}

/**
 * Generate AI Sentiment Prediction based on sentiment and social volume
 */
export function generateAIPrediction(
  sentiment: { level: SentimentLevel; score: number },
  socialVolume: number[]
): AIPrediction {
  const score = sentiment.score
  const volumeTrend = socialVolume.length >= 2 ? socialVolume[socialVolume.length - 1] - socialVolume[0] : 0
  const recentVolume = socialVolume.slice(-3).reduce((a, b) => a + b, 0) / 3
  const avgVolume = socialVolume.reduce((a, b) => a + b, 0) / socialVolume.length

  // Determine prediction type
  let type: PredictionType
  let message: string
  let confidence: number

  if (score >= 50) {
    type = 'bullish'
    if (volumeTrend > 0 && recentVolume > avgVolume * 1.2) {
      message = 'Market sentiment is turning bullish. Momentum and social activity suggest this could be a good time to trade.'
      confidence = Math.min(85, 60 + Math.floor(score / 2))
    } else {
      message = 'Market sentiment is bullish. Consider monitoring for confirmation before entering positions.'
      confidence = Math.min(75, 50 + Math.floor(score / 3))
    }
  } else if (score <= -50) {
    type = 'bearish'
    if (volumeTrend < 0 && recentVolume < avgVolume * 0.8) {
      message = 'Market sentiment is bearish. This is not an ideal time to trade.'
      confidence = Math.min(85, 60 + Math.floor(Math.abs(score) / 2))
    } else {
      message = 'Market sentiment is bearish. Exercise caution and wait for clearer signals.'
      confidence = Math.min(75, 50 + Math.floor(Math.abs(score) / 3))
    }
  } else {
    type = 'neutral'
    message = 'Market sentiment is mixed. Waiting for confirmation may be safer.'
    confidence = 50 + Math.floor(Math.abs(score) / 4)
  }

  return { type, message, confidence }
}

/**
 * Get sentiment display info
 */
export function getSentimentDisplay(level: SentimentLevel): {
  label: string
  color: string
  gradient: string
} {
  switch (level) {
    case 'very_bearish':
      return {
        label: 'Very Bearish',
        color: '#ef4444',
        gradient: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
      }
    case 'bearish':
      return {
        label: 'Bearish',
        color: '#f97316',
        gradient: 'linear-gradient(90deg, #f97316 0%, #fbbf24 100%)',
      }
    case 'neutral':
      return {
        label: 'Neutral',
        color: '#fbbf24',
        gradient: 'linear-gradient(90deg, #fbbf24 0%, #84cc16 100%)',
      }
    case 'bullish':
      return {
        label: 'Bullish',
        color: '#84cc16',
        gradient: 'linear-gradient(90deg, #84cc16 0%, #10b981 100%)',
      }
    case 'very_bullish':
      return {
        label: 'Very Bullish',
        color: '#10b981',
        gradient: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      }
  }
}

/**
 * Get prediction display info
 */
export function getPredictionDisplay(type: PredictionType): {
  color: string
  bgColor: string
  borderColor: string
} {
  switch (type) {
    case 'bullish':
      return {
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
      }
    case 'neutral':
      return {
        color: '#fbbf24',
        bgColor: 'rgba(251, 191, 36, 0.1)',
        borderColor: 'rgba(251, 191, 36, 0.3)',
      }
    case 'bearish':
      return {
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
      }
  }
}

/**
 * Format time ago
 */
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

