import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file from server directory
dotenv.config({ path: join(__dirname, '..', '.env') })

const router = express.Router()

router.post('/', async (req, res) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  const CHAT_API_URL = process.env.CHAT_API_URL || 'https://api.openai.com/v1/chat/completions'
  const usingOpenAI = CHAT_API_URL.includes('openai.com')

  console.log('[server] New chat request received', { 
    messageCount: req.body?.messages?.length || 0,
    model: req.body?.model || 'gpt-4o',
    apiUrl: CHAT_API_URL,
    hasApiKey: !!OPENAI_API_KEY,
    apiKeyPrefix: OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 10) + '...' : 'none'
  })

  if (usingOpenAI && !OPENAI_API_KEY) {
    console.error('[server] Missing OPENAI_API_KEY')
    return res.status(500).json({ 
      error: 'Missing API key',
      message: 'Please create a .env file in the server directory with your OPENAI_API_KEY. See env.example for reference.'
    })
  }

  const { messages, model = 'gpt-4o' } = req.body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' })
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
    }

    // Only send Authorization when the upstream requires OpenAI keys
    if (usingOpenAI) {
      headers['Authorization'] = `Bearer ${OPENAI_API_KEY}`
    }

    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
        stream: false,
      }),
    })

    const text = await response.text()
    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.warn('[server] Chat API returned non-JSON response', text.slice(0, 1000))
      return res.status(502).json({ error: 'Invalid response from chat API', raw: text })
    }

    if (!response.ok) {
      console.error('[server] Chat API error', response.status, data)
      const errorMessage = data.error?.message || data.error || 'Chat API error'
      // Provide more helpful error messages for common issues
      if (response.status === 401) {
        console.error('[server] Authentication failed - check API key')
      } else if (response.status === 429) {
        console.error('[server] Rate limit exceeded')
      } else if (response.status === 500) {
        console.error('[server] OpenAI server error')
      }
      return res.status(response.status).json({ 
        error: errorMessage,
        type: data.error?.type || 'unknown',
        status: response.status
      })
    }

    console.log('[server] Chat response successful')
    res.json(data)
  } catch (err) {
    console.error('[server] Chat request failed', err)
    res.status(500).json({ 
      error: 'Chat request failed', 
      detail: err instanceof Error ? err.message : 'Unknown error'
    })
  }
})

export { router as chatRouter }
