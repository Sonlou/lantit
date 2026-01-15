export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // SECURELY retrieve the key from Vercel Environment Variables
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenRouter API Key not configured on server.' });
  }

  const { messages, model } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers.referer || "https://florascan.vercel.app",
        "X-Title": "FloraScan"
      },
      body: JSON.stringify({ model, messages })
    });

    // NEW CODE: Shows the real error from the server
if (!response.ok) {
    let errorMessage = `Server Error: ${response.status}`;
    try {
        const errorData = await response.json();
        if (errorData.error) errorMessage = errorData.error;
    } catch (e) {
        // If response isn't JSON (e.g. 404 HTML page), keep the status code
    }
    throw new Error(errorMessage);
}
const data = await response.json();
