const express = require('express');
const app = express();
app.use(express.json());

module.exports = app; // Esto permite que Supertest lo use
