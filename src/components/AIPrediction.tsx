import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { getPredictionDisplay, type AIPrediction } from '../services/sentimentAnalysis'

type AIPredictionProps = {
  prediction: AIPrediction
  onSeeMore?: () => void
}

export function AIPredictionComponent({ prediction, onSeeMore }: AIPredictionProps) {
  const [isAnimating, setIsAnimating] = useState(true)
  const display = getPredictionDisplay(prediction.type)

  useEffect(() => {
    // Stop animation after initial render
    const timer = setTimeout(() => setIsAnimating(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="ai-prediction-container">
      <h3 className="ai-prediction-heading">AI Sentiment Prediction</h3>
      <div
        className={`ai-prediction-text ${prediction.type} ${isAnimating ? 'animating' : ''}`}
        style={{
          color: display.color,
          borderColor: display.borderColor,
          backgroundColor: display.bgColor,
        }}
      >
        <p className="ai-prediction-message">{prediction.message}</p>
        {onSeeMore && (
          <button className="ai-prediction-see-more" onClick={onSeeMore} style={{ color: display.color }}>
            See more <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

