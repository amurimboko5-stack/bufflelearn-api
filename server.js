const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Route d'accueil
app.get('/', (req, res) => {
    res.json({ 
        message: 'API BuffleLearn opérationnelle !',
        status: 'success',
        endpoints: {
            chat: '/api/chat',
            health: '/health'
        }
    });
});

// Route de santé (health check)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Route pour le chat (test)
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    res.json({ 
        response: `Vous avez dit : "${message}"`,
        timestamp: new Date()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur BuffleLearn sur le port ${PORT}`);
});
