import { useEffect, useState, useRef } from 'react'
import { Clock, ChevronLeft, ChevronRight, Calendar, Share2, Link2, ExternalLink, X, Plus, ChevronDown, BarChart3 } from 'lucide-react'
import { getTrendingStories, formatTimeAgo, type TrendingStory } from '../services/sentimentAnalysis'
import { SentimentGauge } from './SentimentGauge'
import { SocialVolumeChart } from './SocialVolumeChart'
import { AIPredictionComponent } from './AIPrediction'
import { InteractiveSentimentDashboard } from './InteractiveSentimentDashboard'
import { SocialVolumeDashboard } from './SocialVolumeDashboard'

export function SentimentAnalysisPage() {
  const [stories, setStories] = useState<TrendingStory[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedStory, setExpandedStory] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dashboardStory, setDashboardStory] = useState<TrendingStory | null>(null)
  const [isUnlocked] = useState(false) // TODO: Check if user has staked XFLOW
  const [showSuggestModal, setShowSuggestModal] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [showSocialVolumeDashboard, setShowSocialVolumeDashboard] = useState(false)
  const dateDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadStories()

    // Auto-refresh every 3 minutes
    const interval = setInterval(loadStories, 180000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close date dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false)
      }
    }

    if (showDateDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDateDropdown])

  const loadStories = async () => {
    try {
      setLoading(true)
      const data = await getTrendingStories()
      setStories(data)
    } catch (error) {
      console.error('Failed to load stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month}, ${year}`
  }

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleDateChange = (dateString: string) => {
    const newDate = new Date(dateString)
    if (!isNaN(newDate.getTime())) {
      setCurrentDate(newDate)
      setShowDateDropdown(false)
      // Reload stories for the selected date
      loadStories()
    }
  }

  const handlePreviousDate = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
    loadStories()
  }

  const handleNextDate = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    const today = new Date()
    // Don't allow future dates - compare date strings to ignore time
    if (newDate.toDateString() <= today.toDateString()) {
      setCurrentDate(newDate)
      loadStories()
    }
  }

  const generateDateOptions = () => {
    const options: Date[] = []
    const today = new Date()
    // Generate last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      options.push(date)
    }
    return options
  }

  const handleToggleExpand = (storyId: string) => {
    setExpandedStory(expandedStory === storyId ? null : storyId)
  }

  if (loading && stories.length === 0) {
    return (
      <div className="sentiment-analysis-page">
        <div className="sentiment-loading">
          <p>Loading trending stories...</p>
        </div>
      </div>
    )
  }

  const latestUpdate = stories.length > 0 ? stories[0].updatedAt : Date.now()

  return (
    <div className="sentiment-analysis-page">
      <div className="sentiment-header-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', margin: 0 }}>Sentiment Analysis</h2>
          <button 
            className="sentiment-action-btn primary" 
            onClick={() => setShowSocialVolumeDashboard(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <BarChart3 size={16} />
            View Social Volume Dashboard
          </button>
        </div>
        <p className="sentiment-header-description">
          Explore the most talked-about stories making waves on social media in the past 24 hours is ideal for spotting
          hot topics and staying in the loop with crypto market buzz.
        </p>

        <div className="sentiment-header-controls">
          <div className="sentiment-update-info">
            <Clock size={14} />
            <span>Updated {formatTimeAgo(latestUpdate)}</span>
          </div>

          <div className="sentiment-header-actions">
            <button className="sentiment-nav-btn" aria-label="Previous">
              <ChevronLeft size={18} />
            </button>
            <button className="sentiment-nav-btn" aria-label="Next">
              <ChevronRight size={18} />
            </button>

            <div className="sentiment-date-dropdown-wrapper" ref={dateDropdownRef}>
              <button
                className="sentiment-date-display sentiment-date-dropdown-btn"
                onClick={() => setShowDateDropdown(!showDateDropdown)}
              >
                <Calendar size={14} />
                <span>{formatDate(currentDate)}</span>
                <ChevronDown size={14} className={`date-chevron ${showDateDropdown ? 'open' : ''}`} />
              </button>

              {showDateDropdown && (
                <div className="sentiment-date-dropdown">
                  <div className="date-dropdown-header">
                    <button className="date-nav-btn" onClick={handlePreviousDate} aria-label="Previous date">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="date-dropdown-title">Select Date</span>
                    <button
                      className="date-nav-btn"
                      onClick={handleNextDate}
                      disabled={currentDate.toDateString() >= new Date().toDateString()}
                      aria-label="Next date"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="date-dropdown-list">
                    {generateDateOptions().map((date, index) => {
                      const isToday = date.toDateString() === new Date().toDateString()
                      const isSelected = date.toDateString() === currentDate.toDateString()
                      return (
                        <button
                          key={index}
                          className={`date-dropdown-item ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                          onClick={() => handleDateChange(formatDateForInput(date))}
                        >
                          <span>{formatDate(date)}</span>
                          {isToday && <span className="date-today-badge">Today</span>}
                        </button>
                      )
                    })}
                  </div>
                  <div className="date-dropdown-input-wrapper">
                    <input
                      type="date"
                      className="date-dropdown-input"
                      value={formatDateForInput(currentDate)}
                      max={formatDateForInput(new Date())}
                      onChange={(e) => handleDateChange(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <button className="sentiment-action-btn suggest-btn" onClick={() => setShowSuggestModal(true)}>
              <Plus size={14} />
              Suggest account
            </button>

            <button className="sentiment-action-btn share-btn primary" onClick={() => alert('Share flow coming soon')}>
              <Share2 size={14} />
              Share
            </button>

            <button
              className="sentiment-action-btn link-btn"
              aria-label="Copy link"
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
            >
              <Link2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="sentiment-stories-list">
        {stories.map((story) => (
          <div key={story.id} className="sentiment-story-card">
            <div className="story-content-grid">
              {/* Left Column: Title, Link, Chart */}
              <div className="story-left-column">
                <div className="story-title-row">
                  <h2 className="story-title">
                    {story.rank} {story.title}
                  </h2>
                  <a href="#" className="story-details-link">
                    See details <ExternalLink size={12} />
                  </a>
                </div>
                <div className="story-chart-wrapper">
                  <SocialVolumeChart data={story.socialVolume.data} labels={story.socialVolume.labels} />
                </div>
              </div>

              {/* Middle Column: AI Sentiment Prediction */}
              <div className="story-middle-column">
                {story.aiPrediction ? (
                  <AIPredictionComponent prediction={story.aiPrediction} onSeeMore={() => setDashboardStory(story)} />
                ) : (
                  <div>
                    <h3 className="summary-heading">AI Sentiment Prediction</h3>
                    <p className="summary-text">
                      {expandedStory === story.id ? story.fullSummary || story.aiSummary : story.aiSummary}
                      {story.fullSummary && story.fullSummary.length > story.aiSummary.length && (
                        <button className="read-more-link" onClick={() => handleToggleExpand(story.id)}>
                          {expandedStory === story.id ? ' Read less' : ' Read more'}
                        </button>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Sentiment Gauge */}
              <div className="story-right-column">
                <div className="sentiment-gauge-card">
                  <div className="sentiment-gauge-card-title">SENTIMENT</div>
                  <SentimentGauge sentiment={story.sentiment} size={210} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Sentiment Dashboard Modal */}
      {dashboardStory && <InteractiveSentimentDashboard story={dashboardStory} onClose={() => setDashboardStory(null)} isUnlocked={isUnlocked} />}

      {/* Social Volume Dashboard Modal */}
      {showSocialVolumeDashboard && <SocialVolumeDashboard isUnlocked={isUnlocked} onClose={() => setShowSocialVolumeDashboard(false)} />}

      {/* Suggest Account Modal */}
      {showSuggestModal && <SuggestAccountModal onClose={() => setShowSuggestModal(false)} />}
    </div>
  )
}

function SuggestAccountModal({ onClose }: { onClose: () => void }) {
  const [twitterAccount, setTwitterAccount] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!twitterAccount.trim()) {
      setError('Please enter a Twitter account name')
      return
    }

    if (!description.trim()) {
      setError('Description is mandatory. Please describe why this account is worth adding.')
      return
    }

    // Validate Twitter account format (should start with @)
    const accountPattern = /^@?[\w]+$/
    if (!accountPattern.test(twitterAccount.replace('@', ''))) {
      setError('Please enter a valid Twitter account name')
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Success - close modal and show success message
      alert('Account suggestion submitted successfully! Thank you for your contribution.')
      setTwitterAccount('')
      setDescription('')
      onClose()
    } catch (err) {
      setError('Failed to submit account suggestion. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddAccount = () => {
    // Add another account (clear current form for new entry)
    if (twitterAccount.trim() || description.trim()) {
      if (confirm('Are you sure you want to clear the current form to add another account?')) {
        setTwitterAccount('')
        setDescription('')
        setError(null)
      }
    }
  }

  return (
    <>
      <div className="suggest-account-overlay" onClick={onClose} />
      <div className="suggest-account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="suggest-account-header">
          <h2 className="suggest-account-title">Suggest account</h2>
          <button className="suggest-account-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="suggest-account-content">
          <p className="suggest-account-intro">
            Help us enhance our Social Trends by suggesting Twitter accounts for our database. Your recommendations
            contribute to the improvement of our tools, resulting in better analytics and decision-making.
          </p>

          <div className="suggest-account-requirements">
            <h3 className="suggest-account-requirements-title">Requirements</h3>
            <ul className="suggest-account-requirements-list">
              <li>The content should be related to cryptocurrency, preferably with predictions about crypto market movements</li>
              <li>The account should post at least 10 original posts per month on a regular basis. Reposts will not be counted</li>
              <li>
                You have to add a description why you think this account is worth adding. The description field is mandatory
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="suggest-account-form">
            <div className="suggest-account-field">
              <label htmlFor="twitter-account" className="suggest-account-label">
                Twitter account name
              </label>
              <input
                id="twitter-account"
                type="text"
                className="suggest-account-input"
                placeholder="@twitter"
                value={twitterAccount}
                onChange={(e) => {
                  let value = e.target.value
                  // Auto-add @ if user types without it
                  if (value && !value.startsWith('@')) {
                    value = '@' + value
                  }
                  setTwitterAccount(value)
                  setError(null)
                }}
                disabled={isSubmitting}
              />
            </div>

            <div className="suggest-account-field">
              <label htmlFor="description" className="suggest-account-label">
                Description
              </label>
              <textarea
                id="description"
                className="suggest-account-textarea"
                placeholder="Please describe why you think this account is worth adding. We only accept accounts with a description provided by the user"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  setError(null)
                }}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            {error && <div className="suggest-account-error">{error}</div>}

            <div className="suggest-account-actions">
              <button
                type="button"
                className="suggest-account-add-btn"
                onClick={handleAddAccount}
                disabled={isSubmitting}
              >
                <Plus size={16} />
                Add account
              </button>
              <button
                type="submit"
                className="suggest-account-submit-btn"
                disabled={isSubmitting || !twitterAccount.trim() || !description.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

