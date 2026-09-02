const express = require('express');
const path = require('path');
const app = express();

const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));
app.get('/*', (_, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(4173, () => {
  console.log('Server running on port 4173');
});
