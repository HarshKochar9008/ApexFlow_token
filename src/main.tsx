import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SolanaProvider } from './solana/SolanaProvider'
import { EVMProvider } from './evm/EVMProvider'
import { PrivyProvider } from './privy/PrivyProvider'

function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider>
      <EVMProvider>
        <SolanaProvider>{children}</SolanaProvider>
      </EVMProvider>
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
