import { getTokenInfo } from './dummyData'

export type AutomationDetails = {
  summary: string
  frequency: string
  baseCurrency: string
  asset: string
  assetAddress?: string
  cost: number
  action: 'buy' | 'sell' | 'swap'
  amount?: string
  condition?: string
}

export function parseAutomationPrompt(prompt: string): AutomationDetails | null {
  const lowerPrompt = prompt.toLowerCase()
  
  const automationKeywords = ['check', 'every', 'if', 'then', 'buy', 'sell', 'when', 'automate', 'dca']
  const isAutomation = automationKeywords.some(keyword => lowerPrompt.includes(keyword))
  
  if (!isAutomation) {
    return null
  }

  let frequency = '1h' 
  const frequencyPatterns = [
    { pattern: /every\s+(\d+)\s*hours?/i, format: (n: number) => `${n}h` },
    { pattern: /every\s+(\d+)\s*minutes?/i, format: (n: number) => `${n}m` },
    { pattern: /every\s+(\d+)\s*days?/i, format: (n: number) => `${n}d` },
    { pattern: /every\s+hour/i, format: () => '1h' },
    { pattern: /every\s+day/i, format: () => '1d' },
    { pattern: /daily/i, format: () => '1d' },
  ]
  
  for (const { pattern, format } of frequencyPatterns) {
    const match = prompt.match(pattern)
    if (match) {
      frequency = format(parseInt(match[1]) || 1)
      break
    }
  }

  const tokenPattern = /\b([A-Z]{2,10})\b/g
  const tokens = prompt.match(tokenPattern) || []
  const asset = tokens[0] || 'UNKNOWN'
  
  const tokenInfo = getTokenInfo(asset)
  const assetAddress = tokenInfo?.address || generateMockAddress(asset)

  let amount: string | undefined
  const amountPatterns = [
    /\$(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*\$/i,
    /(\d+(?:\.\d+)?)\s*dollars?/i,
  ]
  
  for (const pattern of amountPatterns) {
    const match = prompt.match(pattern)
    if (match) {
      amount = `$${match[1]}`
      break
    }
  }

  let action: 'buy' | 'sell' | 'swap' = 'buy'
  if (lowerPrompt.includes('sell')) {
    action = 'sell'
  } else if (lowerPrompt.includes('swap')) {
    action = 'swap'
  }

  let condition = ''
  if (lowerPrompt.includes('down') || lowerPrompt.includes('drop')) {
    const downMatch = prompt.match(/(?:down|drop).*?(?:at least|at|least)?\s*(\d+)%/i)
    let timePeriod = '1d' // default
    

    const timePatterns = [
      { pattern: /last\s+day/i, value: '1d' },
      { pattern: /last\s+(\d+)\s*days?/i, value: (m: RegExpMatchArray) => `${m[1]}d` },
      { pattern: /(\d+)\s*days?/i, value: (m: RegExpMatchArray) => `${m[1]}d` },
      { pattern: /(\d+)\s*hours?/i, value: (m: RegExpMatchArray) => `${m[1]}h` },
      { pattern: /(\d+)\s*minutes?/i, value: (m: RegExpMatchArray) => `${m[1]}m` },
      { pattern: /in\s+(\d+[hdm])/i, value: (m: RegExpMatchArray) => m[1] },
    ]
    
    for (const { pattern, value } of timePatterns) {
      const match = prompt.match(pattern)
      if (match) {
        timePeriod = typeof value === 'function' ? value(match) : value
        break
      }
    }
    
    const downPercent = downMatch ? downMatch[1] : '10'
    condition = `down ${downPercent}% in ${timePeriod}`
  } else if (lowerPrompt.includes('up') || lowerPrompt.includes('rise')) {
    const upMatch = prompt.match(/(?:up|rise).*?(?:at least|at|least)?\s*(\d+)%/i)
    let timePeriod = '1d'
    
    const timePatterns = [
      { pattern: /last\s+day/i, value: '1d' },
      { pattern: /last\s+(\d+)\s*days?/i, value: (m: RegExpMatchArray) => `${m[1]}d` },
      { pattern: /(\d+)\s*days?/i, value: (m: RegExpMatchArray) => `${m[1]}d` },
      { pattern: /(\d+)\s*hours?/i, value: (m: RegExpMatchArray) => `${m[1]}h` },
      { pattern: /in\s+(\d+[hdm])/i, value: (m: RegExpMatchArray) => m[1] },
    ]
    
    for (const { pattern, value } of timePatterns) {
      const match = prompt.match(pattern)
      if (match) {
        timePeriod = typeof value === 'function' ? value(match) : value
        break
      }
    }
    
    const upPercent = upMatch ? upMatch[1] : '10'
    condition = `up ${upPercent}% in ${timePeriod}`
  } else if (lowerPrompt.includes('rsi')) {
    const rsiMatch = prompt.match(/rsi.*?(below|above)\s+(\d+)/i)
    if (rsiMatch) {
      condition = `RSI ${rsiMatch[1]} ${rsiMatch[2]}`
    }
  }

  let summary = ''
  if (condition) {
    summary = `${action === 'buy' ? 'Buy' : action === 'sell' ? 'Sell' : 'Swap'} ${asset} when ${condition}`
  } else if (amount) {
    summary = `${action === 'buy' ? 'Buy' : action === 'sell' ? 'Sell' : 'Swap'} ${amount} of ${asset}`
  } else {
    summary = `${action === 'buy' ? 'Buy' : action === 'sell' ? 'Sell' : 'Swap'} ${asset}`
  }

  const baseCurrency = 'USDC'

  const cost = 10

  return {
    summary,
    frequency,
    baseCurrency,
    asset,
    assetAddress,
    cost,
    action,
    amount,
    condition,
  }
}


function generateMockAddress(asset: string): string {
  const hash = asset.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const hex = hash.toString(16).padStart(8, '0')
  return `0x${hex}...${hex.slice(-4).toUpperCase()}AeE0`
}

