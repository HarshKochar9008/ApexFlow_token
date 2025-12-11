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
  console.log('[server] New chat request received', { 
    messageCount: req.body?.messages?.length || 0,
    model: req.body?.model || 'gpt-4o'
  })

  if (!OPENAI_API_KEY) {
    console.error('[server] Missing OPENAI_API_KEY')
    return res.status(500).json({ error: 'Missing API key' })
  }

  const { messages, model = 'gpt-4o' } = req.body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
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
      console.warn('[server] OpenAI returned non-JSON response', text.slice(0, 1000))
      return res.status(502).json({ error: 'Invalid response from OpenAI', raw: text })
    }

    if (!response.ok) {
      console.error('[server] OpenAI API error', response.status, data)
      return res.status(response.status).json({ 
        error: data.error?.message || data.error || 'OpenAI API error',
        type: data.error?.type || 'unknown'
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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Chat API server running on http://localhost:${PORT}`)
  console.log(`📝 Using OpenAI API for text generation`)
})
