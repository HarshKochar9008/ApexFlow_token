import { useEffect, useState } from 'react'
import './App.css'
import { Zap, Rocket, Shield, BotMessageSquare, ArrowUp, ArrowRightLeft, BarChart3, LineChart, Menu, X, User, Settings, LogOut, Wallet, Crown, ArrowUpRight, Copy, Trophy, Compass, Users, Flame, Gift, TrendingUp, Plus, Clock, PlayCircle, PauseCircle, Trash2, Check, Link2 } from 'lucide-react'
const brandLogo = '/Logo.png'
import { FaTelegramPlane } from "react-icons/fa";
import { useWallet } from '@solana/wallet-adapter-react'
import { useLoginWithEmail, usePrivy } from '@privy-io/react-auth'
import { Keypair } from '@solana/web3.js'
import { VolumeChart, StrategiesChart, LatencyChart, SuccessRateChart, TVLChart, CopyTradersChart } from './components/MetricsCharts'
import { parseAutomationPrompt, type AutomationDetails } from './utils/automationParser'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

async function sendChatMessage(messages: ChatMessage[], model: string = 'gpt-4o'): Promise<{ content?: string; error?: string }> {
  // On Vercel there is no local /api proxy, so default to the hosted chat API in production
  const API_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? 'https://apexflow-token.onrender.com/api/chat' : '/api/chat')
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      return { error: errorData.error || `HTTP error! status: ${response.status}` }
    }

    const data = await response.json()
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return { content: data.choices[0].message.content }
    }
    
    return { error: 'Invalid response format from server' }
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Failed to connect to chat server' 
    }
  }
}

function LoginPopup({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="login-popup-overlay" onClick={onClose} />
      <div className="login-popup">
        <div className="login-popup-header">
          <h2 className="login-popup-title">Login to ApexFlow</h2>
          <button className="login-popup-close" onClick={onClose} aria-label="Close login">
            <X size={20} />
          </button>
        </div>
        <div className="login-popup-content">
          <EmailLogin />
        </div>
      </div>
    </>
  )
}

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
    <div className="auth-card-popup">
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

type Page = 'terminal' | 'metrics' | 'pricing' | 'profile' | 'automations'

const navLinks: Array<{ key: Page; label: string }> = [
  { key: 'terminal', label: 'Terminal' },
  { key: 'automations', label: 'Automations' },
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
    price: '$10',
    stake: 'or stake >50,000 ApexFlow',
    highlights: ['15,000 credits/month', '10 live Automations', 'Social Trading', 'Unlimited Terminal messages'],
    invite: '$20 per invited friend',
    cta: 'Upgrade',
    badge: 'For traders ready to run strategies and start social trading',
  },
  {
    name: 'Expert',
    price: '$35',
    stake: 'or stake >300,000 ApexFlow',
    highlights: ['65,000 credits/month', '25 live Automations', 'Social Trading', 'Unlimited Terminal messages'],
    invite: '$25 per invited friend',
    cta: 'Upgrade',
    badge: 'Most popular · run multiple strategies and let others copy',
  },
  {
    name: 'Whale',
    price: '$95',
    stake: 'or stake >1,000,000 ApexFlow',
    highlights: ['250,000 credits/month + bonus', '150 live Automations', 'Social Trading', 'Unlimited Terminal messages'],
    invite: '$30 per invited friend',
    cta: 'Upgrade',
    badge: 'For institutions and high-frequency trading',
  },
] as const

const metricCards: MetricCard[] = [
  { label: 'Monthly Volume', value: '8.2M', change: '+12.4%' },
  { label: 'Strategies Live', value: '300', change: '+4.2%' },
  { label: 'Success Rate', value: '91.3%', change: '+0.8%' },
  { label: 'Avg. Latency', value: '148 ms', change: '-3.1%' },
  { label: 'TVL Managed', value: '$3.24M', change: '+9.5%' },
  { label: 'Copy Traders', value: '9,018', change: '+6.3%' },
]

const heroPrompts = [
  { icon: Rocket, text: '"Hey APEX, buy me 1000$ of APEX"' },
  { icon: ArrowRightLeft, text: '"Automate DCA 50$ of APEX every day. Stop after spending 1000$"' },
  { icon: Shield, text: '"Give me trending coins last 24h from Coingecko"' },
  { icon: BotMessageSquare, text: '"If 15min RSI on FACY is below 30, buy it. Sell 50% when 10x from first buy"' },
  { icon: Zap, text: '"Check every 4 hours if WIRE is down at least 10% last day, then buy 500$"' },
] as const

function App() {
  const { connected, publicKey } = useWallet()
  const { authenticated, logout } = usePrivy()
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Welcome to ApexFlow. Ask me to spin up automations, explain metrics, or run a Solana-ready task.',
    },
  ])
  const [isSending, setIsSending] = useState(false)
  const [dummySolanaAccount, setDummySolanaAccount] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 960px)').matches : false))
  const [page, setPage] = useState<Page>('terminal')
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [automationDetails, setAutomationDetails] = useState<AutomationDetails | null>(null)
  const [showAutomationModal, setShowAutomationModal] = useState(false)
  const isLoggedIn = connected || authenticated

  useEffect(() => {
    if (authenticated && !dummySolanaAccount) {
      const keypair = Keypair.generate()
      setDummySolanaAccount(keypair.publicKey.toBase58())
      setShowLoginPopup(false) // Close login popup when authenticated
    }
  }, [authenticated, dummySolanaAccount])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(max-width: 960px)')
    const handleMediaChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in event ? event.matches : mediaQuery.matches
      setIsMobile(matches)
      if (!matches) {
        setIsSidebarOpen(false)
      }
    }

    handleMediaChange(mediaQuery)
    mediaQuery.addEventListener('change', handleMediaChange as (e: MediaQueryListEvent) => void)
    return () => mediaQuery.removeEventListener('change', handleMediaChange as (e: MediaQueryListEvent) => void)
  }, [])

  const openLoginPopup = () => {
    setShowLoginPopup(true)
  }

  const closeLoginPopup = () => {
    setShowLoginPopup(false)
  }

  const sendMessage = async (rawText: string) => {
    const text = rawText.trim()
    if (!text) return
    
    // Check if this is an automation request
    const automation = parseAutomationPrompt(text)
    
    if (automation) {
      // Show automation confirmation modal
      setAutomationDetails(automation)
      setShowAutomationModal(true)
      
      // Add user message and assistant response
      const userMessage: ChatMessage = { role: 'user', content: text }
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: `Let's get started by validating the asset and setting up the automated task for you. First, I'll check the details for the ${automation.asset} token to ensure it's available for trading. Then, I'll proceed with setting up the automation. Let's go!`,
      }
      setChatMessages([...chatMessages, userMessage, assistantMessage])
      setChatInput('')
      return
    }
    
    // Check for trending coins request
    const lowerText = text.toLowerCase()
    if (lowerText.includes('trending') && (lowerText.includes('coin') || lowerText.includes('coins'))) {
      const { getTrendingCoins } = await import('./utils/dummyData')
      const trendingCoins = getTrendingCoins()
      
      const userMessage: ChatMessage = { role: 'user', content: text }
      const coinsList = trendingCoins.slice(0, 10).map((coin, idx)=> 
        `${idx + 1}. ${coin.name} (${coin.symbol}) - $${coin.price.toFixed(6)} | 24h: ${coin.change24h > 0 ? '+' : ''}${coin.change24h.toFixed(2)}% | Volume: $${(coin.volume24h / 1000).toFixed(0)}K`
      ).join('\n')
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: `Here are the trending coins from the last 24 hours:\n\n${coinsList}\n\n`,
      }
      setChatMessages([...chatMessages, userMessage, assistantMessage])
      setChatInput('')
      return
    }
    
    const userMessage: ChatMessage = { role: 'user', content: text }
    const nextMessages: ChatMessage[] = [...chatMessages, userMessage]
    setChatMessages(nextMessages)
    setChatInput('')
    setIsSending(true)

    try {
      const result = await sendChatMessage(nextMessages, 'gpt-4o')
      
      if (result.error) {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `I encountered an error: ${result.error}. Please check your API configuration and try again.`,
        }
        setChatMessages([...nextMessages, errorMessage])
      } else {
        const aiMessage: ChatMessage = { 
          role: 'assistant', 
          content: result.content || 'No response received.'
        }
        setChatMessages([...nextMessages, aiMessage])
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Unable to connect to the chat service. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your connection and try again.`,
      }
      setChatMessages([...nextMessages, errorMessage])
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



  return (
    <div className="workspace-shell">
      
      {isMobile && isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      {(!isMobile || isSidebarOpen) && (
        <aside className={`side-nav ${isSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="side-brand">
            <img src={brandLogo} alt="ApexFlow" className="side-logo" />
            <div>
              <div onClick={() => setPage('terminal')} className="side-title">ApexFlow</div>
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
                <span className="side-link-content">
                  <span>{link.label}</span>
                  {link.key === 'metrics' && (
                    <span className="side-link-badge">
                      <Flame size={14} />
                      <span style={{ fontSize: '11px' }}>New</span>
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="side-group">
            <p className="side-label">
              Social Trading <span style={{ width: '90px', height: '22px', fontSize: '10px' }} className="pill pill-soon">Coming Soon</span>
            </p>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="side-link" disabled>
              <Compass size={16} />
              <span>Discover</span>
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="side-link" disabled>
              <Users size={16} />
              <span>Activity</span>
            </button>
            
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="side-link" disabled>
              <Trophy size={16} />
              <span>Leaderboard</span>
            </button>
          </div>
          <div className="side-group side-auth-group">
            <p style={{ fontSize: '13px', marginBottom: '10px' }} className="side-label community-help-text">Need help? Join our community</p>
            <div className="community-links">
              <a
                className="community-link community-link-x"
                href="https://x.com/ApexFlow"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
              >
                <X size={18} />
              </a>
              <a
                className="community-link community-link-telegram"
                href="https://t.me/ApexFlow"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
              >
                <FaTelegramPlane size={18} />
              </a>
              <a
                className="community-link community-link-dex"
                href="https://dexscreener.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dex Screener"
              >
                <img src="https://dexscreener.com/favicon.png" alt="Dex Screener" />
              </a>
              <a
                className="community-link community-link-gitbook"
                href="https://docs.apexflow.io"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gitbook"
              >
                <img src="/gitbook.png" alt="Gitbook" />
              </a>
            </div>
          </div>

        </aside>
      )}

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
            <button className="mobile-earn-btn" onClick={() => window.open('https://apexflow.io/earn', '_blank')}>
              <Gift size={16} />
            </button>
            <button className="mobile-login-btn" onClick={openLoginPopup}>
              Login
            </button>
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



        {page === 'terminal' && (
          <div className="chat-shell">
            <div className="terminal-header-bar desktop-only">
              <div className="terminal-header-right">
                <button className="terminal-earn-btn" onClick={() => window.open('https://apexflow.io/earn', '_blank')}>
                  <Gift size={16} />
                  Earn $30
                </button>
                <button className="terminal-login-btn" onClick={openLoginPopup}>
                  Login
                </button>
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
            </div>

            {chatMessages.length <= 1 && (
              <div className="terminal-main-content desktop-only">
                <div className="terminal-hero-container">
                  <img src="/Logo.png" alt="ApexFlow" style={{ width: '125px', height: '100px' }} className="terminal-hero-image" />
                  <div className="terminal-hero-content">
                    <h1 className="terminal-main-title">Automate your trading strategies with your own AI Agent</h1>
                    <p className="terminal-main-subtitle">Just ask APEX to do anything, like:</p>
                    <div className="terminal-prompts-list">
                      {heroPrompts.map(({ text }) => (
                        <button key={text} className="terminal-prompt-item" onClick={() => handlePromptClick(text)}>
                          <span className="terminal-prompt-prefix">&gt;_</span>
                          <span className="terminal-prompt-text">{text}</span>
                        </button>
                      ))}
                    </div>
                    <button className="terminal-create-automation-btn" onClick={() => handlePromptClick(heroPrompts[0].text)}>
                      <Zap size={20} />
                      Create Automation
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                <button className="mobile-cta primary large" onClick={() => handlePromptClick(heroPrompts[0].text)}>
                  <Zap size={20} />
                  Create Automation
                </button>
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

            {chatMessages.length > 1 && (
              <div className="chat-window">
                {chatMessages.map((message, idx) => (
                <div key={idx} className={`chat-message ${message.role}`}>
                  <div className="chat-avatar">{message.role === 'assistant' ? 'A' : 'U'}</div>
                  <div className="chat-bubble-body">
                    <div className="chat-meta">
                      <span className="chat-name">{message.role === 'assistant' ? 'Apex Assistant' : 'You'}</span>
                      <span className="chat-role-label">{message.role === 'assistant' ? 'ApexFlow' : 'User'}</span>
                    </div>
                    <p className="chat-text">{message.content}</p>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="chat-message assistant">
                  <div className="chat-avatar">A</div>
                  <div className="chat-bubble-body typing">
                    <div className="chat-meta">
                      <span className="chat-name">Apex Assistant</span>
                      <span className="chat-role-label">ApexFlow</span>
                    </div>
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

            <div className="terminal-input-area desktop-only">
              <div className="terminal-input-wrapper">
                <button className="terminal-automations-btn" onClick={() => setPage('automations')}>
                  <Zap size={16} />
                  Automations
                </button>
                <textarea
                  className="terminal-input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.currentTarget.value)}
                  placeholder="What I can do for you today...?"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  disabled={isSending}
                  rows={1}
                />
                <button 
                  className="terminal-send-btn" 
                  onClick={handleSend} 
                  disabled={isSending}
                >
                  <ArrowUp size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {page === 'pricing' && <PricingPage />}
        {page === 'metrics' && <MetricsPage />}
        {page === 'automations' && <AutomationsPage onNavigate={setPage} />}
        {page === 'profile' && <ProfilePage onNavigate={setPage} onLogout={logout} getDisplayAddress={getDisplayAddress} authenticated={authenticated} />}

        <div className="chat-input-bar mobile-input">
          <button className="mobile-input-action" onClick={() => setPage('automations')}>
            <Zap size={16} />
            Automations
          </button>
          <div className="chat-input-bar-input">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.currentTarget.value)}
              placeholder={isLoggedIn ? 'What I can do for you today...?' : 'You can chat now — connect to save & personalize.'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isSending}
              rows={1}
            />
          </div>
          <button 
            className="mobile-send-btn" 
            onClick={handleSend} 
            disabled={isSending}
          >
            <ArrowUp size={18} />
          </button>
        </div>

        {/* Login Popup Modal */}
        {showLoginPopup && (
          <LoginPopup onClose={closeLoginPopup} />
        )}

        {/* Automation Confirmation Modal */}
        {showAutomationModal && automationDetails && (
          <ConfirmAutomationModal
            details={automationDetails}
            onClose={() => {
              setShowAutomationModal(false)
              setAutomationDetails(null)
            }}
            onConfirm={() => {
              const confirmMessage: ChatMessage = {
                role: 'assistant',
                content: `Automation confirmed! Your task "${automationDetails.summary}" has been set up and will run every ${automationDetails.frequency}. You'll be notified when it executes.`,
              }
              setChatMessages([...chatMessages, confirmMessage])
              setShowAutomationModal(false)
              setAutomationDetails(null)
            }}
          />
        )}
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
            <span className="profile-popup-apex-label">ApexFlow Balance</span>
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
          <div key={plan.name} className={`pricing-card ${plan.name === 'Expert' ? 'featured' : ''} ${plan.name !== 'Starter' ? 'coming-soon-card' : ''}`}>
            {plan.badge && plan.name === 'Expert' && (
              <span className="pricing-badge">Most popular</span>
            )}
            {plan.name !== 'Starter' && (
              <div className="coming-soon-overlay">
                <span className="coming-soon-text">Live Soon</span>
              </div>
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

type Automation = {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed'
  type: 'scheduled' | 'execution'
  nextRun?: string
  lastRun?: string
  executions?: number
  successRate?: number
}

function AutomationsPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'executions'>('scheduled')
  const [automations, setAutomations] = useState<Automation[]>([])
  
  useEffect(() => {
    const sampleAutomations: Automation[] = [
      {
        id: '1',
        name: 'DCA APEX Purchase',
        description: 'Automate DCA $50 of APEX every day. Stop after spending $1000',
        status: 'active',
        type: 'scheduled',
        nextRun: 'Tomorrow at 9:00 AM',
        lastRun: 'Today at 9:00 AM',
        executions: 12,
        successRate: 100
      },
      {
        id: '2',
        name: 'RSI Buy Signal',
        description: 'If 15min RSI on FACY is below 30, buy it. Sell 50% when 10x from first buy',
        status: 'active',
        type: 'scheduled',
        nextRun: 'In 15 minutes',
        lastRun: '2 hours ago',
        executions: 8,
        successRate: 87.5
      },
      {
        id: '3',
        name: 'Price Drop Alert',
        description: 'Check every 4 hours if WIRE is down at least 10% last day, then buy $500',
        status: 'paused',
        type: 'scheduled',
        nextRun: 'Paused',
        lastRun: 'Yesterday at 2:00 PM',
        executions: 3,
        successRate: 66.7
      },
      {
        id: '4',
        name: 'Trending Coins Fetch',
        description: 'Give me trending coins last 24h from Coingecko',
        status: 'active',
        type: 'execution',
        lastRun: '1 hour ago',
        executions: 24,
        successRate: 95.8
      }
    ]
    setAutomations(sampleAutomations)
  }, [])

  const scheduledAutomations = automations.filter(a => a.type === 'scheduled')
  const executionAutomations = automations.filter(a => a.type === 'execution')

  const handleCreateAutomation = () => {
    onNavigate('terminal')
  }

  const handleToggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(automation => 
      automation.id === id 
        ? { ...automation, status: automation.status === 'active' ? 'paused' : 'active' }
        : automation
    ))
  }

  const handleDeleteAutomation = (id: string) => {
    setAutomations(prev => prev.filter(automation => automation.id !== id))
  }

  const currentAutomations = activeTab === 'scheduled' ? scheduledAutomations : executionAutomations

  return (
    <div className="automations-page">
      <div className="automations-header">
        <div>
          <h2 className="page-title">Automations</h2>
        </div>
        <button className="primary" onClick={handleCreateAutomation}>
          <Plus size={16} />
          Create Automation
        </button>
      </div>

      <div className="automations-tabs">
        <button 
          className={`automation-tab ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          <Clock size={16} />
          Scheduled
        </button>
        <button 
          className={`automation-tab ${activeTab === 'executions' ? 'active' : ''}`}
          onClick={() => setActiveTab('executions')}
        >
          <BarChart3 size={16} />
          Executions
        </button>
      </div>

      {currentAutomations.length === 0 ? (
        <div className="automations-empty-state">
          <div className="empty-state-icon">
            <Zap size={48} />
          </div>
          <h3 className="empty-state-title">No automations found</h3>
          <p className="empty-state-subtitle">Create your first automation!</p>
          <button className="primary large" onClick={handleCreateAutomation}>
            <Plus size={20} />
            Create Automation
          </button>
        </div>
      ) : (
        <div className="automations-grid">
          {currentAutomations.map((automation) => (
            <div key={automation.id} className="automation-card">
              <div className="automation-card-header">
                <div className="automation-card-title-section">
                  <h3 className="automation-card-title">{automation.name}</h3>
                  <span className={`automation-status automation-status-${automation.status}`}>
                    {automation.status === 'active' ? 'Active' : automation.status === 'paused' ? 'Paused' : 'Completed'}
                  </span>
                </div>
                <div className="automation-card-actions">
                  <button 
                    className="automation-action-btn"
                    onClick={() => handleToggleAutomation(automation.id)}
                    title={automation.status === 'active' ? 'Pause' : 'Resume'}
                  >
                    {automation.status === 'active' ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                  </button>
                  <button 
                    className="automation-action-btn"
                    onClick={() => handleDeleteAutomation(automation.id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="automation-card-description">{automation.description}</p>
              <div className="automation-card-details">
                {automation.nextRun && (
                  <div className="automation-detail-item">
                    <Clock size={14} />
                    <span>Next: {automation.nextRun}</span>
                  </div>
                )}
                {automation.lastRun && (
                  <div className="automation-detail-item">
                    <PlayCircle size={14} />
                    <span>Last: {automation.lastRun}</span>
                  </div>
                )}
                {automation.executions !== undefined && (
                  <div className="automation-detail-item">
                    <BarChart3 size={14} />
                    <span>{automation.executions} executions</span>
                  </div>
                )}
                {automation.successRate !== undefined && (
                  <div className="automation-detail-item">
                    <TrendingUp size={14} />
                    <span>{automation.successRate}% success</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MetricsPage() {
  return (
    <div className="metrics-page">
      <div className="page-head">
        <div>
          <p className="side-label">Analytics Dashboard</p>
          <h2 className="page-title">Platform Metrics</h2>
          <p className="muted">Real-time insights and performance data</p>
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
            <p className={`metric-trend ${metric.change.startsWith('-') ? 'neg' : 'pos'}`}>
              <TrendingUp size={14} style={{ marginRight: '4px' }} />
              {metric.change}
            </p>
          </div>
        ))}
      </div>

      <div className="metric-panels">
        <div className="metric-panel">
          <div className="panel-head">
            <div>
              <p className="side-label">Monthly Volume Trend</p>
              <p className="panel-title">Trading volume over time</p>
            </div>
            <span className="pill pill-live">Live</span>
          </div>
          <VolumeChart />
        </div>

        <div className="metric-panel">
          <div className="panel-head">
            <div>
              <p className="side-label">Strategies Growth</p>
              <p className="panel-title">Active strategies deployed</p>
            </div>
            <span className="pill">Weekly</span>
          </div>
          <StrategiesChart />
        </div>
      </div>

      <div className="metric-panels">
        <div className="metric-panel">
          <div className="panel-head">
            <div>
              <p className="side-label">Average Latency</p>
              <p className="panel-title">Response time monitoring</p>
            </div>
            <span className="pill">24h</span>
          </div>
          <LatencyChart />
        </div>

        <div className="metric-panel">
          <div className="panel-head">
            <div>
              <p className="side-label">Success Rate</p>
              <p className="panel-title">Execution success rate</p>
            </div>
            <span className="pill pill-live">Live</span>
          </div>
          <SuccessRateChart />
        </div>
      </div>

      <div className="metric-panels">
        <div className="metric-panel">
          <div className="panel-head">
            <div>
              <p className="side-label">TVL Growth</p>
              <p className="panel-title">Total Value Locked progression</p>
            </div>
            <span className="pill">Monthly</span>
          </div>
          <TVLChart />
        </div>

        <div className="metric-panel">
          <div className="panel-head">
            <div>
              <p className="side-label">Copy Traders</p>
              <p className="panel-title">Active copy trading users</p>
            </div>
            <span className="pill">Weekly</span>
          </div>
          <CopyTradersChart />
        </div>
      </div>

    </div>
  )
}

function ConfirmAutomationModal({ 
  details, 
  onClose, 
  onConfirm 
}: { 
  details: AutomationDetails
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <>
      <div className="automation-modal-overlay" onClick={onClose} />
      <div className="automation-modal">
        <h2 className="automation-modal-title">Confirm Automation</h2>
        
        <div className="automation-modal-content">
          <div className="automation-detail-row">
            <span className="automation-detail-label">Summary</span>
            <span className="automation-detail-value">{details.summary}</span>
          </div>
          
          <div className="automation-detail-row">
            <span className="automation-detail-label">Frequency</span>
            <span className="automation-detail-value">{details.frequency}</span>
          </div>
          
          <div className="automation-detail-row">
            <span className="automation-detail-label">Base Currency</span>
            <span className="automation-detail-value">{details.baseCurrency}</span>
          </div>
          
          <div className="automation-detail-row">
            <span className="automation-detail-label">Asset</span>
            <span className="automation-detail-value">{details.assetAddress || details.asset}</span>
          </div>
          
          <div className="automation-detail-row">
            <span className="automation-detail-label">Cost</span>
            <span className="automation-detail-value automation-cost">
              {details.cost} Credits / Execution
              <Link2 size={14} style={{ marginLeft: '6px', opacity: 0.7 }} />
            </span>
          </div>
        </div>
        
        <div className="automation-modal-actions">
          <button className="automation-modal-cancel" onClick={onClose}>
            <X size={18} />
            Cancel
          </button>
          <button className="automation-modal-confirm" onClick={onConfirm}>
            <Check size={18} />
            Confirm & Execute
          </button>
        </div>
      </div>
    </>
  )
}

export default App
