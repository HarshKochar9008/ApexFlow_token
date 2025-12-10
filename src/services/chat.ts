export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const API_URL = import.meta.env.VITE_CHATGPT5_API_URL || '/api/chat'
const API_KEY = import.meta.env.VITE_CHATGPT5_API_KEY

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const payload = {
    model: 'gpt-5',
    messages,
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (API_KEY) headers.Authorization = `Bearer ${API_KEY}`

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Chat service error: ${response.status}`)
  }

  const data = await response.json()
  // Support both OpenAI-style {choices} and simplified {reply}
  const reply =
    data?.choices?.[0]?.message?.content ??
    data?.reply ??
    data?.content ??
    'No response from ChatGPT-5. Please try again.'

  return reply
}

