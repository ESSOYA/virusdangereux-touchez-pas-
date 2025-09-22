// import 'dotenv/config';
// import express from 'express';
// import startBot from './bot.js';

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(express.json());
// app.get('/', (req, res) => res.send('Bot WhatsApp avec Gemini actif !'));

// // Lancer le bot
// startBot();

// app.listen(port, () => console.log(`Serveur démarré sur http://localhost:${port}`));




import 'dotenv/config';
import express from 'express';
import startBot from './bot.js';
import { initDatabase } from './components/db.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.get('/', (req, res) => res.send('Bot WhatsApp avec Gemini actif !'));

// Lancer le bot après l'initialisation de la base de données
(async () => {
  try {
    await initDatabase();
    console.log('Tables de la base de données initialisées avec succès.');
    await startBot();
  } catch (err) {
    console.error('Erreur lors du démarrage:', err.message);
    process.exit(1);
  }
})();

app.listen(port, () => console.log(`Serveur démarré sur http://localhost:${port}`));