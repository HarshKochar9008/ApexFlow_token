import type { ReactNode } from 'react'
import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth'

type Props = {
  children: ReactNode
}

export function PrivyProvider({ children }: Props) {
  const appId = import.meta.env.VITE_PRIVY_APP_ID

  // Always render PrivyProvider to ensure context is available for hooks
  // If no appId is provided, we still need to render the provider for hooks to work
  // Privy will handle missing/invalid appId gracefully in development
  if (!appId) {
    // In production, warn but still render to prevent hook errors
    if (import.meta.env.PROD) {
      console.warn('VITE_PRIVY_APP_ID is not set. Privy authentication will not work.')
    }
    // Use a non-empty string to satisfy Privy's type requirements
    // The app will still function, just without Privy auth
    return (
      <PrivyProviderBase
        appId="no-app-id-configured"
        config={{
          loginMethods: ['email', 'wallet'],
          appearance: {
            theme: 'dark',
            accentColor: '#a855f7',
          },
        }}
      >
        {children}
      </PrivyProviderBase>
    )
  }

  return (
    <PrivyProviderBase
      appId={appId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#a855f7',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  )
}
