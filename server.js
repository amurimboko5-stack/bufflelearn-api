const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// ROUTES PRINCIPALES
// ============================================

// Route d'accueil (racine)
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenue sur l\'API BuffleLearn !',
        version: '1.0.0',
        status: 'online',
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
        uptime: process.uptime()
    });
});

// Route pour vérifier le statut de l'API
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'API BuffleLearn opérationnelle',
        server: 'Node.js + Express',
        deployed: 'Render.com'
    });
});

// ============================================
// ROUTE DU CHAT (avec Claude AI plus tard)
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
    
    try {
        // Pour l'instant, réponse simulée
        // Plus tard, vous remplacerez par l'appel à Claude API
        const responseMessage = `🤖 Assistant BuffleLearn : Vous avez dit "${message}". L'intégration avec Claude AI sera bientôt disponible !`;
        
        res.json({
            success: true,
            response: responseMessage,
            timestamp: new Date(),
            messageRecu: message
        });
        
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            error: 'Erreur interne du serveur',
            success: false
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
            { role: 'assistant', content: 'Bonjour ! Comment puis-je vous aider ?', timestamp: new Date() }
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
    console.log(`🚀 Serveur BuffleLearn démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}`);
    console.log(`✅ Route santé: http://localhost:${PORT}/health`);
    console.log(`💬 Route chat: POST http://localhost:${PORT}/api/chat`);
});
