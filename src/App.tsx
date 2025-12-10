import { useState } from 'react'
import './App.css'
import { Zap, Rocket, Shield, BotMessageSquare, ArrowRightLeft } from 'lucide-react'
const brandLogo = '/Logo.png'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { sendChatMessage, type ChatMessage } from './services/chat'

const navLinks = [
  'Terminal',
  'Wallet',
  'Brain',
  'Automations',
  'Discover',
  'Activity',
  'Leaderboard',
  'Marketplace',
  'Metrics',
  'Subscription',
] as const

function App() {
  const { connected } = useWallet()
  const [chatInput, setChatInput] = useState('')
  const [showLanding, setShowLanding] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Welcome to ApexFlow. Ask me to spin up automations, explain metrics, or run a Solana-ready task.',
    },
  ])
  const [isSending, setIsSending] = useState(false)
  const canChat = connected || isAuthenticated

  const handleSend = async () => {
    const text = chatInput.trim()
    if (!text) return
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
        'I could not reach the ChatGPT-5 API. Using a local mock response: automation is drafted, ready to review.'
      const mockMessage: ChatMessage = { role: 'assistant', content: fallback }
      setChatMessages([...nextMessages, mockMessage])
    } finally {
      setIsSending(false)
    }
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
            <div className="side-title">ApexFlow</div>
            <div className="side-version">v1.0</div>
          </div>
        </div>
        <div className="side-group">
          <p className="side-label">My Agent</p>
          {navLinks.slice(0, 4).map((link) => (
            <button key={link} className="side-link">
              {link}
            </button>
          ))}
        </div>
        <div className="side-group">
          <p className="side-label">
            Social Trading <span className="pill pill-soon">Soon</span>
          </p>
          {navLinks.slice(4, 7).map((link) => (
            <button key={link} className="side-link">
              {link}
            </button>
          ))}
        </div>
        <div className="side-group">
          {navLinks.slice(7).map((link) => (
            <button key={link} className="side-link">
              {link}
            </button>
          ))}
        </div>
        <div className="side-footer">
          <button className="ghost small">Earn $30</button>
          <WalletMultiButton className="wallet-btn wide" />
          <button className="primary small" onClick={() => setIsAuthenticated(true)}>
            Login
          </button>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="workspace-header">
          <div className="crumb">
            <span className="dot" /> Terminal
          </div>
          <div className="header-actions">
            <button className="ghost">Docs</button>
            <button className="primary" onClick={() => setIsAuthenticated(true)}>
              Login
            </button>
            <WalletMultiButton className="wallet-btn" />
          </div>
        </header>

        <section className="hero-board">
          <div className="hero-card">
            <div className="hero-card-head">
              <div className="hero-icon">
                <Zap size={22} />
              </div>
              <div>
                <p className="hero-kicker">Automate your trading strategies with your own AI Agent</p>
                <p className="hero-sub">
                  Just ask Apex to do anything—natural language to executable automations with wallet safety.
                </p>
              </div>
            </div>
            <ul className="hero-list">
              <li>
                <Rocket size={16} /> "Apex, buy me 1000$ of SOL every 4h. Stop after spending 1000$"
              </li>
              <li>
                <ArrowRightLeft size={16} /> "Automate DCA 50$ daily; stop if drawdown exceeds 10%"
              </li>
              <li>
                <Shield size={16} /> "Check every 4 hours if token X is down 10% last day, then buy 500$"
              </li>
              <li>
                <BotMessageSquare size={16} /> "Alert me when 15m RSI &lt; 30 on FACY and sell 50% when 10x from entry"
              </li>
            </ul>
            <div className="hero-actions">
              <button className="primary large">Deploy Your Agent</button>
              <div className="pill">Powered by expert agents & plugins</div>
            </div>
          </div>
        </section>

        <div className="chat-dock">
          <div className="chat-log-inline">
            {chatMessages.slice(-4).map((message, idx) => (
              <div key={idx} className={`chat-bubble ${message.role}`}>
                <span className="chat-role">{message.role === 'assistant' ? 'Apex' : 'You'}</span>
                <p>{message.content}</p>
              </div>
            ))}
          </div>
          {!canChat && (
            <div className="chat-guard">
              <p>Login or connect your wallet to chat with ApexFlow.</p>
              <div className="guard-actions">
                <button className="primary small" onClick={() => setIsAuthenticated(true)}>
                  Login
                </button>
                <WalletMultiButton className="wallet-btn" />
              </div>
            </div>
          )}
          <div className="chat-input docked">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                canChat ? 'What can I do for you today...?' : 'Login or connect wallet to start chatting...'
              }
              disabled={isSending || !canChat}
            />
            <button className="primary" onClick={handleSend} disabled={isSending || !canChat}>
              {isSending ? 'Thinking...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
