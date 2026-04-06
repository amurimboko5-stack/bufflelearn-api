const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Route d'accueil
app.get('/', (req, res) => {
    res.json({ 
        message: 'API BuffleLearn avec Groq (Llama 3 gratuit) !',
        status: 'online',
        model: 'llama3-70b-8192'
    });
});

// Route santé
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        groq_ready: !!GROQ_API_KEY,
        model: 'llama3-70b-8192'
    });
});

// Route chat avec Groq (Llama 3 gratuit)
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message requis' });
    }

    if (!GROQ_API_KEY) {
        return res.json({ 
            response: "⚠️ Clé API Groq non configurée. Ajoutez GROQ_API_KEY dans Render.",
            success: false
        });
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
                        content: 'Tu es un assistant spécialisé en agriculture et investissement agricole en Afrique. Réponds en français, de manière claire, utile et détaillée. Si tu ne sais pas, dis-le honnêtement.'
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
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            res.json({ 
                response: data.choices[0].message.content,
                success: true,
                model: 'llama3-70b-8192'
            });
        } else if (data.error) {
            console.error('Erreur Groq:', data.error);
            res.json({ 
                response: `❌ Erreur API: ${data.error.message || 'Erreur inconnue'}`,
                success: false
            });
        } else {
            throw new Error('Réponse invalide');
        }

    } catch (error) {
        console.error('Erreur:', error);
        res.json({ 
            response: `Désolé, une erreur technique est survenue. Veuillez réessayer.`,
            success: false
        });
    }
});

// Route 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur BuffleLearn avec Groq (Llama 3) sur le port ${PORT}`);
    console.log(`✅ Groq API configurée: ${GROQ_API_KEY ? 'OUI' : 'NON'}`);
});
