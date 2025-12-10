import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Zap, Rocket, Shield, BotMessageSquare, ArrowRightLeft, BarChart3, LineChart, CreditCard } from 'lucide-react'
const brandLogo = '/Logo.png'
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

type Page = 'terminal' | 'metrics' | 'pricing'

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
    stake: 'or stake >50,000 ETHY',
    highlights: ['15,000 credits/month', '10 live Automations', 'Social Trading', 'Unlimited Terminal messages'],
    invite: '$20 per invited friend',
    cta: 'Upgrade',
    badge: 'For traders ready to run strategies and start social trading',
  },
  {
    name: 'Expert',
    price: '$39.99',
    stake: 'or stake >300,000 ETHY',
    highlights: ['65,000 credits/month', '25 live Automations', 'Social Trading', 'Unlimited Terminal messages'],
    invite: '$25 per invited friend',
    cta: 'Upgrade',
    badge: 'Most popular · run multiple strategies and let others copy',
  },
  {
    name: 'Whale',
    price: '$99.99',
    stake: 'or stake >1,000,000 ETHY',
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
  const { connected } = useWallet()
  const { authenticated, user } = usePrivy()
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
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [page, setPage] = useState<Page>('terminal')
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

  if (showLanding) {
    return (
      <div className="landing">
        <div className="landing-nav">
          <div className="brand">
            <img src={brandLogo} alt="ApexFlow logo" className="brand-logo" />
            <span className="brand-name">ApexFlow</span>
          </div>
          <button className="primary" onClick={() => setShowLanding(false)}>
            Launch ApexFlow
          </button>
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
      <aside className="side-nav">
        <div className="side-brand">
          <img src={brandLogo} alt="ApexFlow" className="side-logo" />
          <div>
            <div onClick={() => setShowLanding(true)} className="side-title">ApexFlow</div>
            <div className="side-version">v1.0</div>
          </div>
        </div>
        <div className="side-group">
          <p className="side-label">Workspace</p>
          {navLinks.map((link) => (
            <button
              key={link.key}
              className={`side-link ${page === link.key ? 'active' : ''}`}
              onClick={() => setPage(link.key)}
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
        <div className="side-footer">
          <button className="ghost small">Earn $30</button>
          <WalletMultiButton className="wallet-btn wide" />
          <button className="primary small" onClick={scrollToEmailLogin}>
            Email Login
          </button>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="workspace-header">
          <div className="crumb">
            <span className="dot" /> {activePageLabel}
          </div>
          <div className="header-actions">
            <button className="ghost">Docs</button>
            <button className="primary" onClick={scrollToEmailLogin}>
              Email Login
            </button>
            <WalletMultiButton className="wallet-btn" />
            {authenticated && (
              <button className="profile-fab" onClick={() => setShowProfilePanel((v) => !v)}>
                <span className="profile-dot" />
                <div className="profile-fab-text">
                  <span>{user?.email?.address || 'Profile'}</span>
                  <small>Solana ready</small>
                </div>
              </button>
            )}
          </div>
        </header>

        {authenticated && showProfilePanel && (
          <div className="profile-flyout">
            <div className="profile-head">
              <div>
                <p className="side-label">Logged in with Privy</p>
                <p className="profile-title">{user?.email?.address || 'Authenticated user'}</p>
              </div>
              <button className="ghost small" onClick={() => setShowProfilePanel(false)}>
                Close
              </button>
            </div>
            <div className="profile-grid">
              <div>
                <p className="profile-label">Email</p>
                <p className="profile-value">{user?.email?.address || 'Unknown email'}</p>
              </div>
              <div>
                <p className="profile-label">Wallet</p>
                <p className="profile-value">{connected ? 'Wallet connected' : 'Wallet not connected'}</p>
              </div>
              <div>
                <p className="profile-label">Solana account</p>
                <p className="profile-value monospace">{dummySolanaAccount || 'Generating...'}</p>
              </div>
            </div>
          </div>
        )}

        {page === 'terminal' && (
          <div className="chat-shell">
            <div className="chat-header">
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

            <div className="prompt-suggestions">
              {heroPrompts.map(({ text }) => (
                <button key={text} className="prompt-chip" onClick={() => handlePromptClick(text)}>
                  {text.replace(/"/g, '')}
                </button>
              ))}
            </div>

            {!canChat && (
              <div className="chat-guard inline">
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

            <div className="chat-input-bar">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={canChat ? 'Ask ApexFlow anything...' : 'Login or connect wallet to start chatting...'}
                disabled={isSending || !canChat}
              />
              <button className="primary" onClick={handleSend} disabled={isSending || !canChat}>
                {isSending ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {page === 'pricing' && <PricingPage />}
        {page === 'metrics' && <MetricsPage />}
      </div>
    </div>
  )
}

function PricingPage() {
  return (
    <div className="pricing-page">
      <div className="page-head">
        <div>
          <p className="side-label">Plans and Pricing</p>
          <h2 className="page-title">Pick the right plan before you scale</h2>
          <p className="page-sub">Stake or subscribe — every tier unlocks more automations, credits, and perks.</p>
        </div>
        <div className="page-actions">
          <button className="ghost">
            <CreditCard size={16} /> Billing FAQ
          </button>
          <button className="primary">
            <Zap size={16} /> Talk to sales
          </button>
        </div>
      </div>

      <div className="pricing-grid">
        {pricingPlans.map((plan) => (
          <div key={plan.name} className={`pricing-card ${plan.name === 'Expert' ? 'featured' : ''}`}>
            <div className="pricing-top">
              <div className="plan-name">
                <span>{plan.name}</span>
                {plan.badge && <span className="pill pill-soon">{plan.badge}</span>}
              </div>
              <p className="plan-price">{plan.price}</p>
              {plan.stake && <p className="plan-stake">{plan.stake}</p>}
              {plan.footnote && <p className="plan-footnote">{plan.footnote}</p>}
            </div>
            <ul className="plan-list">
              {plan.highlights.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
              {plan.misses?.map((item: string) => (
                <li key={item} className="muted">
                  ✕ {item}
                </li>
              ))}
            </ul>
            {plan.invite && <p className="plan-invite">{plan.invite}</p>}
            <button className={`plan-cta ${plan.name === 'Starter' ? 'ghost' : 'primary'}`}>{plan.cta}</button>
          </div>
        ))}
      </div>

      <div className="pricing-notes">
        <div className="note">
          <Zap size={16} />
          <div>
            <p className="note-title">Each Automation execution = 10 credits</p>
            <p className="note-sub">$0.02 per execution when out of credits</p>
          </div>
        </div>
        <div className="note">
          <LineChart size={16} />
          <div>
            <p className="note-title">TradingView Advanced Charts are free to use</p>
            <p className="note-sub">Included across all tiers for planning and automation</p>
          </div>
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
