require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor operativo',
    environment: process.env.NODE_ENV || 'development'
  });
});

// GEMINI (modelo gemini-1.5-flash con API v1)
app.post('/api/gemini', async (req, res) => {
  try {
    const text = req.body.text;
    if (!text) return res.status(400).json({ success: false, error: "Falta el campo 'text'" });

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text }],
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";
    res.json({ success: true, response: reply });

  } catch (err) {
    console.error("Error en Gemini API:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: "Error en Gemini API" });
  }
});

// COHERE (modelo command-r-plus con endpoint /chat)
app.post('/api/cohere', async (req, res) => {
  try {
    const text = req.body.text;
    if (!text) return res.status(400).json({ success: false, error: "Falta el campo 'text'" });

    const response = await axios.post(
      "https://api.cohere.ai/v1/chat",
      {
        message: text,
        model: "command-r-plus"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data?.text || "Sin respuesta";
    res.json({ success: true, response: reply });

  } catch (err) {
    console.error("Error en Cohere API:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: "Error en Cohere API" });
  }
});

// MISTRAL (modelo open-mistral-7b con endpoint /chat/completions)
app.post('/api/mistral', async (req, res) => {
  try {
    const text = req.body.text;
    if (!text) return res.status(400).json({ success: false, error: "Falta el campo 'text'" });

    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: "open-mistral-7b",
        messages: [{ role: "user", content: text }],
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content || "Sin respuesta";
    res.json({ success: true, response: reply });

  } catch (err) {
    console.error("Error en Mistral API:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: "Error en Mistral API" });
  }
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Ruta no encontrada" });
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
