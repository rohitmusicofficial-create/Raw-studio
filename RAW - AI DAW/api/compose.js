// Vercel serverless function: sends RAW's composer prompts to an AI model.
// Order: Gemini (free tier via Google AI Studio) -> Groq (free tier) as backup.
// Set at least GEMINI_API_KEY in Vercel > Project > Settings > Environment Variables.
// Optional: GEMINI_MODEL, GEMINI_FALLBACK_MODEL, GROQ_API_KEY, GROQ_MODEL.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const prompt = req.body && req.body.prompt;
  if (typeof prompt !== 'string' || !prompt || prompt.length > 24000) return res.status(400).json({ error: 'Bad prompt' });

  const tries = [];
  if (process.env.GEMINI_API_KEY) {
    tries.push(['Gemini', () => gemini(prompt, process.env.GEMINI_MODEL || 'gemini-3.6-flash')]);
    tries.push(['Gemini', () => gemini(prompt, process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite')]);
  }
  if (process.env.GROQ_API_KEY) tries.push(['Groq', () => groq(prompt, process.env.GROQ_MODEL || 'llama-3.3-70b-versatile')]);
  if (!tries.length) return res.status(503).json({ error: 'AI not configured' });

  for (const [provider, run] of tries) {
    try {
      const text = await run();
      if (text) return res.status(200).json({ text, provider });
    } catch (e) { /* try the next provider */ }
  }
  return res.status(502).json({ error: 'All AI providers failed' });
}

async function gemini(prompt, model) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.9, maxOutputTokens: 6000 }
    })
  });
  if (!r.ok) throw new Error('gemini ' + r.status);
  const j = await r.json();
  return ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || []).map(p => p.text || '').join('');
}

async function groq(prompt, model) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + process.env.GROQ_API_KEY },
    body: JSON.stringify({ model, temperature: 0.9, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] })
  });
  if (!r.ok) throw new Error('groq ' + r.status);
  const j = await r.json();
  return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
}
