const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.get('/', (req, res) => {
    res.json({ message: 'API BuffleLearn avec Groq (Llama 3 gratuit) !' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', groq_ready: !!GROQ_API_KEY });
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message requis' });
    }

    if (!GROQ_API_KEY) {
        return res.json({ response: "⚠️ Clé API Groq non configurée." });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-70b-8192',
                messages: [
                    {
                        role: 'system',
                        content: 'Tu es un assistant spécialisé en agriculture en Afrique. Réponds en français, de manière claire et utile.'
                    },
                    { role: 'user', content: message }
                ],
                max_tokens: 1024,
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            res.json({ response: data.choices[0].message.content });
        } else {
            res.json({ response: `Erreur: ${data.error?.message || 'Inconnue'}` });
        }
    } catch (error) {
        res.json({ response: `Erreur: ${error.message}` });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur Groq sur port ${PORT}`);
});
