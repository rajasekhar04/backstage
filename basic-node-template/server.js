// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const chatRouter = require('./routes/chat');

const app = express();
app.use(express.json());

// Serve the static demo UI from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount the chat API router
app.use('/api', chatRouter);

// Health check endpoint
app.get('/_health', (req, res) => {
  res.json({ ok: true, service: '{{ parameters.name }}' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Service '{{ parameters.name }}' listening on port ${port}`);
});
