const express = require('express');
const volleyball = require('volleyball');

const auth = require('./auth');

const port = 1337;

require('dotenv').config();

const app = express();

app.use(volleyball);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the fullstack js project');
});

app.use('/auth', auth);

app.listen(port, () => {
  console.log(`Server started listening on port ${port}`);
});