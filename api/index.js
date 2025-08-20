const express = require('express');
const app = express();

app.get('/api/index', (req, res) => {
  res.status(200).send('Hello from Vercel API!');
});

module.exports = app;