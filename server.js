const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'API BuffleLearn opérationnelle !' });
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    res.json({ response: `Vous avez dit : "${message}"` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur sur le port ${PORT}`);
});
