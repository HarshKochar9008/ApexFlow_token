import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrum, optimism } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

const queryClient = new QueryClient()

// Configure wagmi with MetaMask connector
const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, optimism],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'ApexFlow',
        url: typeof window !== 'undefined' ? window.location.origin : '',
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
})

type Props = {
  children: ReactNode
}

export function EVMProvider({ children }: Props) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
