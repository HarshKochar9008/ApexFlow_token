export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash'
const GEMINI_API_URL =
  import.meta.env.VITE_GEMINI_API_URL ||
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const FALLBACK_REPLY =
  'Gemini is temporarily unavailable. Using a local mock response: automation is drafted, ready to review.'

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key missing. Set VITE_GEMINI_API_KEY.')
    return FALLBACK_REPLY
  }

  // Gemini expects role "user" or "model"; treat system as user context.
  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }))

  const url = GEMINI_API_URL.includes('?')
    ? `${GEMINI_API_URL}&key=${GEMINI_API_KEY}`
    : `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    })

    if (!response.ok) {
      console.error('Gemini chat error', response.status, response.statusText)
      return FALLBACK_REPLY
    }

    const data = await response.json()
    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || '')
        .join('')
        .trim() ||
      data?.reply ||
      data?.content ||
      FALLBACK_REPLY

    return reply
  } catch (err) {
    console.error('Gemini chat request failed', err)
    return FALLBACK_REPLY
  }
}

