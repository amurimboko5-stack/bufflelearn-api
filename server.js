const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// CONFIGURATION CLAUDE API (depuis variable d'environnement)
// ============================================
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

// Vérification que la clé API est présente
if (!CLAUDE_API_KEY) {
    console.error('⚠️ ERREUR: La variable d\'environnement ANTHROPIC_API_KEY n\'est pas définie !');
    console.error('⚠️ Ajoutez-la dans Render: Environment → ANTHROPIC_API_KEY');
}

// ============================================
// ROUTES PRINCIPALES
// ============================================

// Route d'accueil (racine)
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenue sur l\'API BuffleLearn avec Claude AI !',
        version: '2.0.0',
        status: 'online',
        model: 'claude-sonnet-4-6',
        endpoints: {
            root: '/',
            health: '/health',
            chat: '/api/chat (POST)',
            api_status: '/api/status'
        }
    });
});

// Route de santé (health check)
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime(),
        claude_configured: !!CLAUDE_API_KEY
    });
});

// Route pour vérifier le statut de l'API
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'API BuffleLearn opérationnelle avec Claude',
        server: 'Node.js + Express',
        deployed: 'Render.com',
        ai_model: 'claude-sonnet-4-6',
        claude_ready: !!CLAUDE_API_KEY
    });
});

// ============================================
// ROUTE DU CHAT AVEC CLAUDE AI
// ============================================

app.post('/api/chat', async (req, res) => {
    const { message, userId, conversationId } = req.body;
    
    // Vérification que le message existe
    if (!message || message.trim() === '') {
        return res.status(400).json({
            error: 'Le message est requis',
            success: false
        });
    }
    
    // Vérification que la clé API est configurée
    if (!CLAUDE_API_KEY) {
        return res.status(500).json({
            error: 'Clé API Claude non configurée',
            success: false,
            response: '⚠️ L\'API Claude n\'est pas configurée. Veuillez ajouter ANTHROPIC_API_KEY dans les variables d\'environnement Render.'
        });
    }
    
    try {
        // Appel à l'API Claude
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
                temperature: 0.7,
                messages: [
                    {
                        role: 'user',
                        content: `Tu es un assistant spécialisé en agriculture et investissement agricole en Afrique. Réponds de manière claire, utile et en français à cette question : ${message}`
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (data.content && data.content[0] && data.content[0].text) {
            res.json({
                success: true,
                response: data.content[0].text,
                timestamp: new Date(),
                messageRecu: message,
                model: 'claude-sonnet-4-6'
            });
        } else if (data.error) {
            console.error('Erreur Claude:', data.error);
            res.json({
                success: true,
                response: `❌ Erreur API Claude : ${data.error.message || 'Erreur inconnue'}. Vérifiez votre clé API.`,
                timestamp: new Date()
            });
        } else {
            throw new Error('Réponse invalide de Claude');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            error: 'Erreur interne du serveur',
            success: false,
            response: 'Désolé, une erreur technique est survenue. Veuillez réessayer.'
        });
    }
});

// ============================================
// ROUTE POUR LES MESSAGES (historique)
// ============================================

app.get('/api/messages/:userId', async (req, res) => {
    const { userId } = req.params;
    
    res.json({
        success: true,
        userId: userId,
        messages: [
            { role: 'user', content: 'Bonjour', timestamp: new Date() },
            { role: 'assistant', content: 'Bonjour ! Comment puis-je vous aider avec Claude AI ?', timestamp: new Date() }
        ]
    });
});

// ============================================
// ROUTE 404 - Page non trouvée
// ============================================

app.use((req, res) => {
    res.status(404).json({
        error: 'Route non trouvée',
        message: `La route ${req.method} ${req.url} n'existe pas`,
        availableEndpoints: [
            'GET /',
            'GET /health',
            'GET /api/status',
            'POST /api/chat',
            'GET /api/messages/:userId'
        ]
    });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur BuffleLearn avec Claude Sonnet démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}`);
    console.log(`✅ Route santé: http://localhost:${PORT}/health`);
    console.log(`💬 Route chat: POST http://localhost:${PORT}/api/chat`);
    console.log(`🤖 Modèle IA: claude-sonnet-4-6`);
    console.log(`🔑 Claude API configurée: ${CLAUDE_API_KEY ? '✅ OUI' : '❌ NON'}`);
});
