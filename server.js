const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

app.get('/', (req, res) => {
    res.json({ message: 'API BuffleLearn avec DeepSeek !' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', deepseek_ready: !!DEEPSEEK_API_KEY });
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message requis' });
    }

    if (!DEEPSEEK_API_KEY) {
        return res.json({
            response: "⚠️ Clé API DeepSeek non configurée."
        });
    }

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'Tu es un assistant spécialisé en agriculture en Afrique. Réponds en français, de manière claire.'
                    },
                    { role: 'user', content: message }
                ],
                max_tokens: 1024
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
    console.log(`Serveur DeepSeek sur port ${PORT}`);
});
