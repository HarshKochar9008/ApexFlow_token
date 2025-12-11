export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatResponse {
  content: string
  error?: string
  model?: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function sendChatMessage(
  messages: ChatMessage[],
  model: string = 'gpt-4o'
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, model }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      const errorMessage = errorData.error?.message || errorData.error || `HTTP ${response.status}`
      console.error('Chat API error:', errorMessage)
      return {
        content: '',
        error: errorMessage,
      }
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    const usedModel = data?.model || model

    if (!content) {
      console.error('No content in OpenAI response:', data)
      return {
        content: '',
        error: 'No response content from OpenAI',
        model: usedModel,
      }
    }

    return { 
      content,
      model: usedModel,
    }
  } catch (err) {
    console.error('Chat API request failed:', err)
    return {
      content: '',
      error: err instanceof Error ? err.message : 'Service unavailable',
    }
  }
}

