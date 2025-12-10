import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Zap, Rocket, Shield, BotMessageSquare, ArrowUp, ArrowRightLeft, BarChart3, LineChart, Menu, X, User, Settings, LogOut, Wallet, Crown, ArrowUpRight, Copy } from 'lucide-react'
const brandLogo = '/Logo.png'
import { FaTelegramPlane } from "react-icons/fa";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { sendChatMessage, type ChatMessage } from './services/chat'
import { useLoginWithEmail, usePrivy } from '@privy-io/react-auth'
import { Keypair } from '@solana/web3.js'

function EmailLogin() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'code-sent' | 'logging-in' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const { sendCode, loginWithCode } = useLoginWithEmail()
  const { authenticated } = usePrivy()

  const handleSendCode = async () => {
    setError(null)
    if (!email.trim()) {
      setError('Enter an email to receive your one-time code.')
      return
    }
    setStatus('sending')
    try {
      await sendCode({ email })
      setStatus('code-sent')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to send code.'
      setError(message)
      setStatus('error')
    }
  }

  const handleLogin = async () => {
    setError(null)
    if (!code.trim()) {
      setError('Paste the code from your email to continue.')
      return
    }
    setStatus('logging-in')
    try {
      await loginWithCode({ code })
      setStatus('idle')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.'
      setError(message)
      setStatus('error')
    }
  }

  const disabled = authenticated || status === 'sending' || status === 'logging-in'

  return (
    <div className="auth-card" id="email-login">
      <p className="side-label">Login with email (Privy)</p>
      <div className="auth-row">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          disabled={disabled}
        />
        <button className="primary small" onClick={handleSendCode} disabled={disabled}>
          {status === 'sending' ? 'Sending...' : 'Send Code'}
        </button>
      </div>
      <div className="auth-row">
        <input
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.currentTarget.value)}
          disabled={authenticated || status === 'logging-in'}
        />
        <button className="ghost small" onClick={handleLogin} disabled={authenticated || status === 'logging-in'}>
          {status === 'logging-in' ? 'Verifying...' : 'Login'}
        </button>
      </div>
      {error && <p className="auth-error">{error}</p>}
      {authenticated && <p className="pill">Authenticated via Privy</p>}
      {status === 'code-sent' && !authenticated && <p className="pill pill-soon">Code sent. Check your email.</p>}
    </div>
  )
}

type Page = 'terminal' | 'metrics' | 'pricing' | 'profile'

const navLinks: Array<{ key: Page; label: string }> = [
  { key: 'terminal', label: 'Terminal' },
  { key: 'metrics', label: 'Metrics' },
  { key: 'pricing', label: 'Pricing' },
]

type PricingPlan = {
  name: string
  price: string
  badge?: string
  stake?: string
  highlights: string[]
  misses?: string[]
  footnote?: string
  invite?: string
  cta: string
}

type MetricCard = { label: string; value: string; change: string }

const trendingPools = [
  {
    rank: 1,
    pair: 'BEAST/WETH',
    price: '$0.633382',
    volume: '$2.84M',
    liquidity: '$429.75K',
    fdv: '$6.34M',
    changes: { '5m': '-4.13%', '1h': '+67.23%', '6h': '+188.77%', '24h': '+2419.37%' },
    tag: '🔥',
  },
  {
    rank: 2,
    pair: 'PRXVT/VRTUAL',
    price: '$0.007335',
    volume: '$844.89K',
    liquidity: '$405.55K',
    fdv: '$7.34M',
    changes: { '5m': '+0.00%', '1h': '-2.96%', '6h': '-1.52%', '24h': '-1.20%' },
    tag: '🔥',
  },
  {
    rank: 3,
    pair: 'BGLD/WETH',
    price: '$0.000225',
    volume: '$81.53K',
    liquidity: '$49.51K',
    fdv: '$212.28K',
    changes: { '5m': '+0.00%', '1h': '-9.10%', '6h': '+24.72%', '24h': '+104.05%' },
    tag: '🔥',
  },
] as const

const trendingBreakdown = [
  {
    title: 'BEAST / WETH',
    items: ['Price Change: +2419.37%', 'Volume: $2,836,236.69', 'Image'],
  },
  {
    title: 'PRXVT / VIRTUAL',
    items: ['Price Change: -1.20%', 'Volume: $844,887.84', 'Image'],
  },
  {
    title: 'BGLD / WETH 1h',
    items: ['Price Change: +104.05%', 'Volume: $81,528.89', 'Image'],
  },
] as const

const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: '$0',
    badge: 'Pay-as-you-go',
    highlights: ['1,000 free one-time credits', '2 live Automations', '10 messages/day'],
    misses: ['Social Trading'],
    footnote: 'No payment required',
    cta: 'Active Plan',
  },
  {
    name: 'Pro',
    price: '$14.99',
    stake: 'or stake >50,000 ApexFlow',
    highlights: ['15,000 credits/month', '10 live Automations', 'Social Trading', 'Unlimited Terminal messages'],
    invite: '$20 per invited friend',
    cta: 'Upgrade',
    badge: 'For traders ready to run strategies and start social trading',
  },
  {
    name: 'Expert',
    price: '$39.99',
    stake: 'or stake >300,000 ApexFlow',
    highlights: ['65,000 credits/month', '25 live Automations', 'Social Trading', 'Unlimited Terminal messages'],
    invite: '$25 per invited friend',
    cta: 'Upgrade',
    badge: 'Most popular · run multiple strategies and let others copy',
  },
  {
    name: 'Whale',
    price: '$99.99',
    stake: 'or stake >1,000,000 ApexFlow',
    highlights: ['250,000 credits/month + bonus', '150 live Automations', 'Social Trading', 'Unlimited Terminal messages'],
    invite: '$30 per invited friend',
    cta: 'Upgrade',
    badge: 'For institutions and high-frequency trading',
  },
] as const

const metricCards: MetricCard[] = [
  { label: 'Monthly Volume', value: '$184.2M', change: '+12.4%' },
  { label: 'Strategies Live', value: '3,142', change: '+4.2%' },
  { label: 'Success Rate', value: '91.3%', change: '+0.8%' },
  { label: 'Avg. Latency', value: '246 ms', change: '-3.1%' },
  { label: 'TVL Managed', value: '$72.8M', change: '+9.5%' },
  { label: 'Copy Traders', value: '12,884', change: '+6.3%' },
]

const heroPrompts = [
  { icon: Rocket, text: '"Apex, buy me 1000$ of SOL every 4h. Stop after spending 1000$"' },
  { icon: ArrowRightLeft, text: '"Automate DCA 50$ daily; stop if drawdown exceeds 10%"' },
  { icon: Shield, text: '"Check every 4 hours if token X is down 10% last day, then buy 500$"' },
  { icon: BotMessageSquare, text: '"Alert me when 15m RSI < 30 on FACY and sell 50% when 10x from entry"' },
] as const

function App() {
  const { connected, publicKey } = useWallet()
  const { authenticated, logout } = usePrivy()
  const [chatInput, setChatInput] = useState('')
  const [showLanding, setShowLanding] = useState(true)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Welcome to ApexFlow. Ask me to spin up automations, explain metrics, or run a Solana-ready task.',
    },
  ])
  const [isSending, setIsSending] = useState(false)
  const [dummySolanaAccount, setDummySolanaAccount] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [page, setPage] = useState<Page>('terminal')
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const canChat = connected || authenticated
  const activePageLabel = useMemo(() => navLinks.find((n) => n.key === page)?.label ?? 'Terminal', [page])

  useEffect(() => {
    if (authenticated && !dummySolanaAccount) {
      const keypair = Keypair.generate()
      setDummySolanaAccount(keypair.publicKey.toBase58())
    }
  }, [authenticated, dummySolanaAccount])

  const scrollToEmailLogin = () => {
    document.getElementById('email-login')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const sendMessage = async (rawText: string) => {
    const text = rawText.trim()
    if (!text) return
    if (!canChat) {
      setChatInput(text)
      return
    }
    const userMessage: ChatMessage = { role: 'user', content: text }
    const nextMessages: ChatMessage[] = [...chatMessages, userMessage]
    setChatMessages(nextMessages)
    setChatInput('')
    setIsSending(true)

    try {
      const reply = await sendChatMessage(nextMessages)
      const aiMessage: ChatMessage = { role: 'assistant', content: reply }
      setChatMessages([...nextMessages, aiMessage])
    } catch (error) {
      const fallback =
        'I could not reach the Gemini API. Using a local mock response: automation is drafted, ready to review.'
      const mockMessage: ChatMessage = { role: 'assistant', content: fallback }
      setChatMessages([...nextMessages, mockMessage])
    } finally {
      setIsSending(false)
    }
  }

  const handleSend = async () => {
    await sendMessage(chatInput)
  }

  const handlePromptClick = async (prompt: string) => {
    setChatInput(prompt)
    await sendMessage(prompt)
  }

  const getDisplayAddress = () => {
    if (connected && publicKey) return `${publicKey.toBase58().slice(0, 6)}...${publicKey.toBase58().slice(-4)}`
    if (dummySolanaAccount) return `${dummySolanaAccount.slice(0, 6)}...${dummySolanaAccount.slice(-4)}`
    return '0x2CeE...3F21'
  }

  const handleCopyAddress = async () => {
    try {
      const address = getDisplayAddress()
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(address)
      }
    } catch (err) {
      console.error('Failed to copy address', err)
    }
  }

  const handleProfileClick = () => {
    setShowProfilePopup(!showProfilePopup)
  }

  const handleNavigateToProfile = () => {
    setShowProfilePopup(false)
    setPage('profile')
  }


  if (showLanding) {
    return (
      <div className="landing">
        <div className="landing-nav">
          <div className="brand">
            <img src={brandLogo} alt="ApexFlow logo" className="brand-logo" />
            <span className="brand-name">ApexFlow</span>
          </div>
        </div>
        <div className="landing-hero">
          <p className="eyebrow">Your autonomous trading assistant</p>
          <h1 className="landing-title">Build, automate, and run strategies 24/7</h1>
          <p className="landing-sub">
            Set your strategies with natural language and let ApexFlow execute them continuously. Powered by AI guidance
            and Solana speed, amplified by social discovery.
          </p>
          <div className="landing-actions">
            <button className="primary large" onClick={() => setShowLanding(false)}>
              Launch ApexFlow
            </button>
            <button className="ghost large">Buy $APEX</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="workspace-shell">
      {/* Global profile icon — fixed to top-right */}
      <div className="profile-fab desktop-only profile-icon-wrapper">
        <button className="profile-icon-btn" onClick={handleProfileClick}>
          <User size={20} />
        </button>
        {showProfilePopup && (
          <ProfilePopup 
            onClose={() => setShowProfilePopup(false)}
            onNavigateToProfile={handleNavigateToProfile}
            onNavigateToPricing={() => { setShowProfilePopup(false); setPage('pricing'); }}
            onLogout={() => { setShowProfilePopup(false); logout(); }}
            getDisplayAddress={getDisplayAddress}
            handleCopyAddress={handleCopyAddress}
          />
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      <aside className={`side-nav ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="side-brand">
          <img src={brandLogo} alt="ApexFlow" className="side-logo" />
          <div>
            <div onClick={() => setShowLanding(true)} className="side-title">ApexFlow</div>
            <div className="side-version">v1.0</div>
          </div>
          <button 
            className="sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="side-group">
          <p className="side-label">Workspace</p>
          {navLinks.map((link) => (
            <button
              key={link.key}
              className={`side-link ${page === link.key ? 'active' : ''}`}
              onClick={() => {
                setPage(link.key)
                setIsSidebarOpen(false)
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
        <div className="side-group">
          <p className="side-label">
            Social Trading <span className="pill pill-soon">Soon</span>
          </p>
          <button className="side-link" disabled>
            Discover
          </button>
          <button className="side-link" disabled>
            Marketplace
          </button>
        </div>
        <div className="side-group side-auth-group">
          <p className="side-label">Connect & Login</p>
          <div className="side-auth-buttons">
            <WalletMultiButton className="wallet-btn side-wallet-btn" />
            <button className="primary side-login-btn" onClick={scrollToEmailLogin}>
              Login
            </button>
            <button 
              className="ghost side-docs-btn" 
              onClick={() => window.open('https://docs.apexflow.io', '_blank')}
            >
              Docs
            </button>
          </div>
        </div>
        <div className="side-footer">
          <div className="social-links">
            <a href="https://x.com/ApexFlow" target="_blank" rel="noopener noreferrer">
              <X size={18} />
            </a>
            <a href="https://t.me/ApexFlow" target="_blank" rel="noopener noreferrer">
              <FaTelegramPlane size={18} />
            </a>
          </div>
        </div>
      </aside>

      <div className="workspace-main">
        {/* Mobile Header */}
        <header className="mobile-header">
          <div className="mobile-header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
          <div className="mobile-header-credits">
            <span className="mobile-credits-badge">STARTER</span>
            <span className="mobile-credits-dot" />
            <span className="mobile-credits-text">811 credits</span>
          </div>
          <div className="mobile-header-right">
            <div className="profile-icon-wrapper">
              <button className="profile-icon-btn" onClick={handleProfileClick}>
                <User size={18} />
              </button>
              {showProfilePopup && (
                <ProfilePopup 
                  onClose={() => setShowProfilePopup(false)}
                  onNavigateToProfile={handleNavigateToProfile}
                  onNavigateToPricing={() => { setShowProfilePopup(false); setPage('pricing'); }}
                  onLogout={() => { setShowProfilePopup(false); logout(); }}
                  getDisplayAddress={getDisplayAddress}
                  handleCopyAddress={handleCopyAddress}
                />
              )}
            </div>
          </div>
        </header>

        {/* Mobile Actions - Wallet Connect, Login, Docs */}
        <div className="mobile-actions">
          <div className="mobile-actions-row">
            <WalletMultiButton className="wallet-btn mobile-wallet-btn" />
            <button className="primary mobile-login-btn" onClick={scrollToEmailLogin}>
              Login
            </button>
          </div>
          <button 
            className="ghost mobile-docs-btn" 
            onClick={() => window.open('https://docs.apexflow.io', '_blank')}
          >
            Docs
          </button>
        </div>

        {/* Desktop Header */}
        <header className="workspace-header desktop-only">
          <div className="crumb">
            <span className="dot" /> {activePageLabel}
          </div>
          <div className="header-actions" />
        </header>


        {page === 'terminal' && (
          <div className="chat-shell">
            {/* Mobile Hero Section - shows when no messages or initial state */}
            {chatMessages.length <= 1 && (
              <div className="mobile-hero">
                <div className="mobile-hero-brand">
                  <img src={brandLogo} alt="ApexFlow" className="mobile-logo" />
                  <span className="mobile-brand-name">ApexFlow</span>
                  <span className="mobile-brand-ai">AI</span>
                </div>
                <h1 className="mobile-hero-title">Automate your trading strategies with your own AI Agent</h1>
                <p className="mobile-hero-subtitle">Just ask ApexFlow to do anything, like:</p>
                <div className="mobile-prompts">
                  {heroPrompts.map(({ text }) => (
                    <button key={text} className="mobile-prompt-item" onClick={() => handlePromptClick(text)}>
                      <span className="prompt-prefix">&gt;_</span>
                      <span className="prompt-text">{text.replace(/"/g, '')}</span>
                    </button>
                  ))}
                </div>
                <button className="mobile-cta primary large" onClick={() => canChat && handlePromptClick(heroPrompts[0].text)}>
                  <Zap size={20} />
                  Create Automation
                </button>
                {/* <div className="mobile-hero-chat-input">
                  <div className="chat-input-bar-input">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.currentTarget.value)}
                      placeholder={canChat ? 'What I can do for you today...?' : 'Login or connect wallet to start chatting...'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      disabled={isSending || !canChat}
                      rows={1}
                    />
                  </div>
                  <button className="mobile-send-btn" onClick={handleSend} disabled={isSending || !canChat}>
                    <ArrowUp size={18} />
                  </button>
                </div> */}
                <div className="powered-by">
                  <div className="powered-by-icons">
                    <div className="powered-icon" />
                    <div className="powered-icon" />
                    <div className="powered-icon" />
                    <div className="powered-icon" />
                    <div className="powered-icon" />
                  </div>
                  <span className="powered-by-text">Powered by expert agents & plugins</span>
                </div>
              </div>
            )}

            {/* Desktop Chat Header - Hide when chat is active */}
            {chatMessages.length <= 1 && (
              <div className="chat-header desktop-only">
                <div>
                  <p className="side-label">ApexFlow Chat</p>
                  <p className="chat-title">Chat with your trading agent</p>
                  <p className="muted">Natural language to automations, insights, and Solana-ready tasks.</p>
                </div>
                <div className="chat-status">
                  <span className={`status-dot ${canChat ? 'online' : ''}`} />
                  <span>{canChat ? 'Ready' : 'Connect wallet or email to chat'}</span>
                </div>
              </div>
            )}

            {/* Chat Window - only show if messages exist */}
            {chatMessages.length > 1 && (
              <div className="chat-window">
                {chatMessages.map((message, idx) => (
                <div key={idx} className={`chat-message ${message.role}`}>
                  <div className="chat-avatar">{message.role === 'assistant' ? 'A' : 'You'.slice(0, 1)}</div>
                  <div className="chat-bubble-body">
                    <div className="chat-meta">
                      <span className="chat-name">{message.role === 'assistant' ? 'Apex' : 'You'}</span>
                      <span className="chat-role-label">{message.role === 'assistant' ? 'Assistant' : 'User'}</span>
                    </div>
                    <p className="chat-text">{message.content}</p>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="chat-message assistant">
                  <div className="chat-avatar">A</div>
                  <div className="chat-bubble-body typing">
                    <span className="chat-name">Apex</span>
                    <div className="dot-bounce">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}
              </div>
            )}

            {chatMessages.length <= 1 && (
              <div className="prompt-suggestions desktop-only">
                {heroPrompts.map(({ text }) => (
                  <button key={text} className="prompt-chip" onClick={() => handlePromptClick(text)}>
                    {text.replace(/"/g, '')}
                  </button>
                ))}
              </div>
            )}

            {!canChat && (
              <div className="chat-guard inline desktop-only">
                <div>
                  <p className="muted">Login or connect your wallet to chat with ApexFlow.</p>
                  <p className="muted">We only use this to personalize responses.</p>
                </div>
                <div className="guard-actions">
                  <EmailLogin />
                  <WalletMultiButton className="wallet-btn" />
                </div>
              </div>
            )}

            <div className="desktop-chat-input desktop-only">
              <div className="desktop-chat-input-wrapper">
                <textarea
                  className="desktop-chat-textarea"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.currentTarget.value)}
                  placeholder={canChat ? 'What I can do for you today...?' : 'Login or connect wallet to start chatting...'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  disabled={isSending || !canChat}
                  rows={2}
                />
                <button 
                  className="desktop-chat-send-btn" 
                  onClick={handleSend} 
                  disabled={isSending || !canChat}
                >
                  <ArrowUp size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {page === 'pricing' && <PricingPage />}
        {page === 'metrics' && <MetricsPage />}
        {page === 'profile' && <ProfilePage onNavigate={setPage} onLogout={logout} getDisplayAddress={getDisplayAddress} authenticated={authenticated} />}

        <div className="chat-input-bar mobile-input">
          <div className="chat-input-bar-input">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.currentTarget.value)}
              placeholder={canChat ? 'What I can do for you today...?' : 'Login or connect wallet to start chatting...'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isSending || !canChat}
              rows={1}
            />
          </div>
          <button 
            className="mobile-send-btn" 
            onClick={handleSend} 
            disabled={isSending || !canChat}
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ProfilePopup({ 
  onClose, 
  onNavigateToProfile, 
  onNavigateToPricing, 
  onLogout, 
  getDisplayAddress, 
  handleCopyAddress
}: {
  onClose: () => void
  onNavigateToProfile: () => void
  onNavigateToPricing: () => void
  onLogout: () => void
  getDisplayAddress: () => string
  handleCopyAddress: () => void
}) {
  return (
    <>
      <div className="profile-popup-overlay" onClick={onClose} />
      <div className="profile-popup">
        <div className="profile-popup-top">
          <div className="profile-popup-plan-row">
            <span className="profile-popup-plan-text">STARTER</span>
            <div className="profile-popup-credits-info">
              <span className="profile-popup-credits-dot" />
              <span className="profile-popup-credits-text">1,000 credits</span>
            </div>
          </div>
        </div>

        <div className="profile-popup-content">
          <div className="profile-popup-wallet-info">
            <Wallet size={16} className="wallet-icon-small" />
            <div className="profile-popup-wallet-details">
              <span className="profile-popup-wallet-address">{getDisplayAddress()}</span>
              <button 
                className="profile-popup-copy-btn" 
                onClick={handleCopyAddress}
                aria-label="Copy address"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div className="profile-popup-apex-row">
            <span className="profile-popup-apex-label" style={{ fontWeight: 'bold'  ,fontSize: '14px', color: '#fff'}}>ApexFlow Balance: </span>
            <span className="profile-popup-apex-value">0.00</span>
          </div>
        </div>

        <div className="profile-popup-divider" />

        <div className="profile-popup-content">
          <div className="profile-popup-current-plan">
            <div className="profile-popup-plan-title">
              <Crown size={16} />
              <span>Current Plan</span>
            </div>
            <div className="profile-popup-plan-value">STARTER</div>
            <button className="profile-popup-upgrade-btn" onClick={onNavigateToPricing}>
              <ArrowUpRight size={16} />
              Upgrade Plan
            </button>
          </div>
        </div>

        <div className="profile-popup-divider" />

        <div className="profile-popup-content profile-popup-menu">
          <button className="profile-popup-menu-item" onClick={onNavigateToProfile}>
            <span>Settings</span>
            <Settings size={16} />
          </button>
          <button className="profile-popup-menu-item profile-popup-logout-item" onClick={onLogout}>
            <span>Log out</span>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  )
}

function PricingPage() {
  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h2 className="pricing-title">Plans and Pricing</h2>
        <p className="pricing-subtitle">Pick the right plan before you scale</p>
      </div>

      <div className="pricing-grid">
        {pricingPlans.map((plan) => (
          <div key={plan.name} className={`pricing-card ${plan.name === 'Expert' ? 'featured' : ''}`}>
            {plan.badge && plan.name === 'Expert' && (
              <span className="pricing-badge">Most popular</span>
            )}
            <div className="pricing-card-header">
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price-row">
                <span className="plan-price">{plan.price}</span>
                {plan.stake && <span className="plan-stake">or stake {plan.stake.replace('or stake ', '')}</span>}
              </div>
            </div>
            <ul className="plan-list">
              {plan.highlights.map((item) => (
                <li key={item}>
                  <span className="checkmark">✓</span>
                  {item}
                </li>
              ))}
              {plan.misses?.map((item: string) => (
                <li key={item} className="plan-miss">
                  <span className="cross">✕</span>
                  {item}
                </li>
              ))}
            </ul>
            {plan.invite && (
              <div className="plan-invite">
                <span className="plan-invite-text">{plan.invite}</span>
              </div>
            )}
            <button className={`plan-cta ${plan.name === 'Starter' ? 'ghost' : 'primary'}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <p className="pricing-footer-text">
          Each Automation execution = 10 credits • $0.02 per execution when out of credits
        </p>
        <p className="pricing-footer-text">
          TradingView Advanced Charts are free to use across all tiers
        </p>
      </div>
    </div>
  )
}

function ProfilePage({ onNavigate, onLogout, getDisplayAddress, authenticated }: { 
  onNavigate: (page: Page) => void
  onLogout: () => void
  getDisplayAddress: () => string
  authenticated: boolean
}) {
  const handleCopyAddress = async () => {
    try {
      const address = getDisplayAddress()
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(address)
      }
    } catch (err) {
      console.error('Failed to copy address', err)
    }
  }

  if (!authenticated) {
    return (
      <div className="profile-page">
        <div className="page-head">
          <div>
            <p className="side-label">Profile</p>
            <h2 className="page-title">Sign in to view your profile</h2>
            <p className="page-sub">Connect your wallet or login with email to access your profile</p>
          </div>
        </div>
        <div className="profile-signin-card">
          <p className="muted">Please sign in to continue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header-section">
          <div className="profile-plan-badges">
            <span className="profile-plan-badge">STARTER</span>
            <span className="profile-credits-badge">
              <span className="profile-credits-dot" />
              1,000 credits
            </span>
          </div>
        </div>

        <div className="profile-wallet-section">
          <div className="profile-wallet-card">
            <div className="profile-wallet-header">
              <Wallet size={18} />
              <span className="profile-wallet-label">Wallet Address</span>
            </div>
            <div className="profile-wallet-address-row">
              <span className="profile-wallet-address-text">{getDisplayAddress()}</span>
              <button className="profile-icon-btn-small" onClick={handleCopyAddress} aria-label="Copy address">
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="profile-balance-card">
            <div className="profile-balance-label">ApexFlow Balance</div>
            <div className="profile-balance-value">0.00</div>
          </div>
        </div>

        <div className="profile-plan-section">
          <div className="profile-plan-card">
            <div className="profile-plan-header">
              <Crown size={18} />
              <span className="profile-plan-label">Current Plan</span>
            </div>
            <div className="profile-plan-name-text">STARTER</div>
            <button 
              className="profile-upgrade-button"
              onClick={() => onNavigate('pricing')}
            >
              <ArrowUpRight size={16} />
              Upgrade Plan
            </button>
          </div>
        </div>

        <div className="profile-actions-section">
          <button className="profile-action-btn">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className="profile-action-btn profile-logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function MetricsPage() {
  return (
    <div className="metrics-page">
      <div className="page-head">
        <div>
          <p className="side-label">Metrics Overview</p>
          <h2 className="page-title">Strategy performance and platform health</h2>
          <p className="page-sub">Track volume, reliability, adoption, and automation success in one place.</p>
        </div>
        <div className="page-actions">
          <button className="ghost">
            <BarChart3 size={16} /> Export CSV
          </button>
          <button className="primary">
            <LineChart size={16} /> Create report
          </button>
        </div>
      </div>

      <div className="metric-kpis">
        {metricCards.map((metric) => (
          <div key={metric.label} className="metric-tile">
            <p className="metric-label">{metric.label}</p>
            <p className="metric-value">{metric.value}</p>
            <p className={`metric-trend ${metric.change.startsWith('-') ? 'neg' : 'pos'}`}>{metric.change}</p>
          </div>
        ))}
      </div>

      <div className="metric-panels">
        <div className="metric-panel">
          <div className="panel-head">
            <div>
              <p className="side-label">Execution Reliability</p>
              <p className="panel-title">Tasks executed on time</p>
            </div>
            <span className="pill pill-live">Live</span>
          </div>
          <div className="bar-rows">
            {['Automations', 'Copy Trades', 'Alerts', 'On-chain Actions'].map((label, idx) => (
              <div key={label} className="bar-row">
                <span>{label}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${85 - idx * 6}%` }} />
                </div>
                <span className="bar-value">{85 - idx * 6}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-panel">
          <div className="panel-head">
            <div>
              <p className="side-label">User Growth</p>
              <p className="panel-title">New traders & stakers</p>
            </div>
            <span className="pill">Weekly</span>
          </div>
          <div className="trend-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={day} className="spark">
                <div className="spark-bar" style={{ height: `${40 + idx * 6}px` }} />
                <span className="spark-label">{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="metric-panels">
        <div className="metric-panel">
          <div className="panel-head">
            <div>
              <p className="side-label">Trending Pools</p>
              <p className="panel-title">Volume leaders</p>
            </div>
          </div>
          <div className="trending-list">
            {trendingPools.map((pool) => (
              <div key={pool.pair} className="trending-row">
                <div className="pair-meta">
                  <span className="rank">{pool.rank}</span>
                  <div>
                    <p className="pair-title">
                      {pool.pair} {pool.tag}
                    </p>
                    <p className="muted">Price {pool.price}</p>
                  </div>
                </div>
                <div className="mini-metrics">
                  <div>
                    <p className="muted">Volume</p>
                    <p className="value">{pool.volume}</p>
                  </div>
                  <div>
                    <p className="muted">Liquidity</p>
                    <p className="value">{pool.liquidity}</p>
                  </div>
                  <div>
                    <p className="muted">FDV</p>
                    <p className="value">{pool.fdv}</p>
                  </div>
                  <div className="change-grid">
                    {Object.entries(pool.changes).map(([label, change]) => (
                      <span key={label} className={change.startsWith('-') ? 'neg' : 'pos'}>
                        {label} {change}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="metric-panel">
          <div className="panel-head">
            <div>
              <p className="side-label">Breakdown</p>
              <p className="panel-title">Performance snapshots</p>
            </div>
          </div>
          <div className="breakdown-list">
            {trendingBreakdown.map((item) => (
              <div key={item.title} className="breakdown-item glass">
                <p className="pair-title">{item.title}</p>
                <ul>
                  {item.items.map((entry) => (
                    <li key={entry} className="muted">
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
