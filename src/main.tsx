import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SolanaProvider } from './solana/SolanaProvider'
import { PrivyProvider } from '@privy-io/react-auth'

const privyAppId = import.meta.env.VITE_PRIVY_APP_ID ?? 'demo-app-id'

function AppProviders({ children }: { children: ReactNode }) {
  if (!import.meta.env.VITE_PRIVY_APP_ID) {
    // eslint-disable-next-line no-console
    console.warn('VITE_PRIVY_APP_ID not set; using demo-app-id. Add your real Privy app ID to enable auth.')
  }

  return (
    <PrivyProvider appId={privyAppId} config={{ embeddedWallets: { createOnLogin: 'users-without-wallets' } }}>
      <SolanaProvider>{children}</SolanaProvider>
    </PrivyProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
