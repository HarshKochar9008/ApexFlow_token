import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  const CHAT_API_URL = process.env.CHAT_API_URL || 'https://apexflow-token.onrender.com/api/chat'
  
  console.log('[server] New chat request received', { 
    messageCount: req.body?.messages?.length || 0,
    model: req.body?.model || 'gpt-4o',
    apiUrl: CHAT_API_URL
  })

  // Only require OPENAI_API_KEY if using OpenAI directly
  if (!CHAT_API_URL.includes('apexflow-token') && !OPENAI_API_KEY) {
    console.error('[server] Missing OPENAI_API_KEY')
    return res.status(500).json({ error: 'Missing API key' })
  }

  const { messages, model = 'gpt-4o' } = req.body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' })
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
    }
    
    // Add Authorization header only if using OpenAI directly
    if (!CHAT_API_URL.includes('apexflow-token') && OPENAI_API_KEY) {
      headers['Authorization'] = `Bearer ${OPENAI_API_KEY}`
    }
    
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: headers,
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
      return res.status(response.status).json({ 
        error: data.error?.message || data.error || 'Chat API error',
        type: data.error?.type || 'unknown'
      })
    }

    console.log('[server] Chat response successful')
    res.json(data)
  } catch (err) {
    console.error('[server] Chat request failed', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    
    // Check for common network errors
    if (errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      return res.status(503).json({ 
        error: 'Unable to connect to chat service', 
        detail: `Failed to reach ${CHAT_API_URL}. Please check if the service is available.`
      })
    }
    
    res.status(500).json({ 
      error: 'Chat request failed', 
      detail: errorMessage
    })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Chat API server running on http://localhost:${PORT}`)
  const apiUrl = process.env.CHAT_API_URL || 'https://apexflow-token.onrender.com/api/chat'
  console.log(`📝 Using chat API: ${apiUrl}`)
})
