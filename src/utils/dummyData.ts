

export type TokenInfo = {
  symbol: string
  name: string
  address: string
  price?: number
  change24h?: number
  volume24h?: number
}

export type TrendingCoin = {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  rank: number
}

const DUMMY_TOKENS: Record<string, TokenInfo> = {
  'WIRE': {
    symbol: 'WIRE',
    name: 'Wire Protocol',
    address: '0x0b3A...AeE0',
    price: 0.0234,
    change24h: -12.5,
    volume24h: 1250000,
  },
  'APEX': {
    symbol: 'APEX',
    name: 'ApexFlow Token',
    address: '0x4A7E...B2F1',
    price: 0.156,
    change24h: 5.3,
    volume24h: 3200000,
  },
  'FACY': {
    symbol: 'FACY',
    name: 'Facy Token',
    address: '0x8C9D...E3F4',
    price: 0.0045,
    change24h: -8.2,
    volume24h: 890000,
  },
  'BEAST': {
    symbol: 'BEAST',
    name: 'Beast Token',
    address: '0x2F5A...C1D2',
    price: 0.633,
    change24h: 2419.37,
    volume24h: 2840000,
  },
  'PRXVT': {
    symbol: 'PRXVT',
    name: 'Private Token',
    address: '0x6B8E...F4A5',
    price: 0.0073,
    change24h: -1.2,
    volume24h: 845000,
  },
  'BGLD': {
    symbol: 'BGLD',
    name: 'BGold Token',
    address: '0x9C1F...D5B6',
    price: 0.0002,
    change24h: 104.05,
    volume24h: 81500,
  },
  'SOL': {
    symbol: 'SOL',
    name: 'Solana',
    address: 'So11111111111111111111111111111111111111112',
    price: 145.23,
    change24h: 2.1,
    volume24h: 1250000000,
  },
  'USDC': {
    symbol: 'USDC',
    name: 'USD Coin',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    price: 1.0,
    change24h: 0.01,
    volume24h: 5000000000,
  },
  'WETH': {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    price: 3245.67,
    change24h: 1.8,
    volume24h: 890000000,
  },
}


export const DUMMY_TRENDING_COINS: TrendingCoin[] = [
  {
    id: 'beast',
    symbol: 'BEAST',
    name: 'Beast Token',
    price: 0.633382,
    change24h: 2419.37,
    volume24h: 2836236.69,
    marketCap: 6334000,
    rank: 1,
  },
  {
    id: 'prxvt',
    symbol: 'PRXVT',
    name: 'Private Token',
    price: 0.007335,
    change24h: -1.20,
    volume24h: 844887.84,
    marketCap: 7340000,
    rank: 2,
  },
  {
    id: 'bgld',
    symbol: 'BGLD',
    name: 'BGold Token',
    price: 0.000225,
    change24h: 104.05,
    volume24h: 81528.89,
    marketCap: 212280,
    rank: 3,
  },
  {
    id: 'wire',
    symbol: 'WIRE',
    name: 'Wire Protocol',
    price: 0.0234,
    change24h: -12.5,
    volume24h: 1250000,
    marketCap: 2340000,
    rank: 4,
  },
  {
    id: 'apex',
    symbol: 'APEX',
    name: 'ApexFlow Token',
    price: 0.156,
    change24h: 5.3,
    volume24h: 3200000,
    marketCap: 15600000,
    rank: 5,
  },
]


export function getTokenInfo(symbol: string): TokenInfo | null {
  const upperSymbol = symbol.toUpperCase()
  const token = DUMMY_TOKENS[upperSymbol]
  
  if (token) {
    return token
  }

  return {
    symbol: upperSymbol,
    name: `${upperSymbol} Token`,
    address: generateMockAddress(upperSymbol),
    price: Math.random() * 10,
    change24h: (Math.random() - 0.5) * 20,
    volume24h: Math.random() * 5000000,
  }
}


export function getTrendingCoins(): TrendingCoin[] {
  return DUMMY_TRENDING_COINS
}


export function validateToken(symbol: string): { valid: boolean; info?: TokenInfo } {
  const info = getTokenInfo(symbol)
  if (info) {
    return { valid: true, info }
  }
  return { valid: false }
}


function generateMockAddress(symbol: string): string {
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const hex = hash.toString(16).padStart(8, '0')
  const endHex = (hash * 7).toString(16).padStart(4, '0').toUpperCase()
  return `0x${hex}...${endHex}AeE0`
}

