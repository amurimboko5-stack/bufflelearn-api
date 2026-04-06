const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// VOTRE CLÉ API CLAUDE
const CLAUDE_API_KEY = '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';

// Route d'accueil
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenue sur l\'API BuffleLearn avec Claude AI !',
        status: 'online',
        model: 'claude-sonnet-4-6'
    });
});

// Route santé
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// ROUTE CHAT AVEC CLAUDE SONNET
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message requis' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 1024,
                messages: [
                    {
                        role: 'user',
                        content: `Tu es un assistant spécialisé en agriculture et investissement agricole en Afrique. Réponds de manière claire, utile et en français à cette question : ${message}`
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (data.content && data.content[0]) {
            res.json({
                success: true,
                response: data.content[0].text
            });
        } else if (data.error) {
            console.error('Erreur Claude:', data.error);
            res.json({
                success: true,
                response: `❌ Erreur API : ${data.error.message}. Vérifiez votre clé API.`
            });
        } else {
            throw new Error('Réponse invalide');
        }

    } catch (error) {
        console.error('Erreur:', error);
        res.json({
            success: true,
            response: `📚 Je suis désolé, une erreur technique est survenue. Veuillez réessayer.`
        });
    }
});

// Route 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur BuffleLearn avec Claude Sonnet sur le port ${PORT}`);
});
