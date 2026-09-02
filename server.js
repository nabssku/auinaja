import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiApp from './server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Mount API routes
app.use(apiApp);

// Mount Static frontend
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 4173;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AUinAja Unified App running on port ${PORT}`);
});
