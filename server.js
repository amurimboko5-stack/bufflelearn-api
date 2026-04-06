const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Lecture de la clé API DeepSeek (à ajouter dans Render)
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

app.get('/', (req, res) => {
    res.json({ message: 'API BuffleLearn avec DeepSeek (gratuit) !' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', deepseek_ready: !!DEEPSEEK_API_KEY });
});

// Route chat avec DeepSeek (gratuit)
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message requis' });
    }

    if (!DEEPSEEK_API_KEY) {
        return res.json({
            response: "⚠️ Clé API DeepSeek non configurée. Ajoute DEEPSEEK_API_KEY dans Render."
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
                        content: 'Tu es un assistant spécialisé en agriculture et investissement agricole en Afrique. Réponds en français, de manière claire et utile.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 1024,
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            res.json({
                response: data.choices[0].message.content,
                success: true
            });
        } else {
            throw new Error(data.error?.message || 'Erreur inconnue');
        }

    } catch (error) {
        console.error('Erreur:', error);
        res.json({
            response: `Désolé, une erreur est survenue : ${error.message}`,
            success: false
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur BuffleLearn avec DeepSeek sur le port ${PORT}`);
});
