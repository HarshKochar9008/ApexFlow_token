import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { clusterApiUrl, type Cluster } from '@solana/web3.js'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import '@solana/wallet-adapter-react-ui/styles.css'

type Props = {
  children: ReactNode
}

export function SolanaProvider({ children }: Props) {
  const network = ((import.meta.env.VITE_SOLANA_NETWORK as Cluster) || 'devnet') as Cluster
  const endpoint = import.meta.env.VITE_SOLANA_RPC || clusterApiUrl(network)

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

