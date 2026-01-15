// File: api/identify.js
module.exports = async function handler(req, res) {
  // 1. Check for POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Get the API Key securely from Vercel Settings
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server Error: OpenRouter API Key is missing.' });
  }

  // 3. Get the data sent from your frontend (index.html)
  const { messages, model } = req.body;

  try {
    // 4. YOUR CORRECT FETCH STRUCTURE
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://florascan.vercel.app", // Your site URL
        "X-Title": "FloraScan",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model, // Using the model passed from frontend
        messages: messages // Using the text/image passed from frontend
      })
    });

    // 5. Handle errors from OpenRouter
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `OpenRouter Error: ${errorText}` });
    }

    // 6. Send the success data back to frontend
    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: `Server logic error: ${error.message}` });
  }
}
