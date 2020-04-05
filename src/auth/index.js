const router = require('express').Router();
const Joi = require('@hapi/joi');

const db = require('../db/connection');
const users = db.get('users');

const registerSchema = Joi.object().keys({
  firstName: Joi.string().alphanum().min(3).max(30).required(),
  lastName: Joi.string().alphanum().min(3).max(30).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  userClass: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
  email: Joi.string().email({ minDomainSegments: 2 }),
});

router.get('/register', (req, res) => {
  res.send('Welcome to the Register route');
});

router.post('/register', (req, res) => {
  const result = Joi.validate(req.body, registerSchema);
  console.log(result);
});

router.get('/login', (req, res) => {
  res.send('Yo! This is the login route');
});

module.exports = router;
