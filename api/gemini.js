export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // SECURELY retrieve the key from Vercel Environment Variables
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Google API Key not configured on server.' });
  }

  const { type, prompt, text } = req.body;

  try {
    // Case 1: Text Generation (Care Tips, Folklore)
    if (type === 'generate') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
      return res.status(200).json({ text: resultText });
    }

    // Case 2: Text-to-Speech (TTS)
    if (type === 'tts') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }
            }
          }
        })
      });
      const data = await response.json();
      const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return res.status(200).json({ audioData });
    }

  } catch (error) {
    console.error("Gemini Backend Error:", error);
    res.status(500).json({ error: error.message });
  }
}
