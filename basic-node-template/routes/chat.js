const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY environment variable not set. The chatbot will not work.');
}

// NOTE: 'gemini-2.5-flash' is a custom model name that worked for you.
// Publicly available models include 'gemini-1.5-flash' or 'gemini-pro'.
// You may need to change this depending on your project's available models.
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are InsuranceAssistant — a helpful, concise insurance domain assistant.
Be factual. Ask clarifying questions when needed. If asked for private policy details, request authentication. Do not hallucinate policy specifics.`;

async function callGemini(prompt) {
  const requestBody = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      maxOutputTokens: 512,
      temperature: 0.2
    }
  };

  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text;
}

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const lastUserMessage = messages?.[messages.length - 1]?.text;

    if (!lastUserMessage) {
      return res.status(400).json({ error: 'No user message found.' });
    }

    // A simple prompt structure. For more complex conversations, you might build a history.
    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${lastUserMessage}\nAssistant:`;

    const reply = await callGemini(prompt);
    res.json({ reply: reply || "I'm sorry, I couldn't provide a response." });
  } catch (err) {
    console.error('Chat route error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
