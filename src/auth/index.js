const router = require('express').Router();
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

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

router.get('/register', (req, res, next) => {
  res.send('Welcome to the Register route');
});

router.post('/register', (req, res, next) => {
  const result = registerSchema.validate(req.body);
  if (!result.error) {
    users
      .findOne({
        username: req.body.username,
      })
      .then((user) => {
        if (user !== null) {
          console.log('Username already exists');
          const error = new Error('Username already exists');
          next(error);
        } else {
          bcrypt
            .hash(req.body.password.trim(), saltRounds)
            .then((hashedPassword) => {
              const newUser = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username,
                userClass: req.body.userClass,
                email: req.body.email,
                password: hashedPassword,
              };
              users
                .insert(newUser)
                .then((addedUser) => {
                  delete addedUser.password;
                  jwt.sign(
                    addedUser,
                    process.env.TOKEN_SECRET,
                    { expiresIn: '1d' },
                    (err, token) => {
                      if (err) {
                        next(err);
                      } else {
                        res.json({ addedUser, token });
                      }
                    }
                  );
                })
                .catch((eror) => next(error));
            })
            .catch((error) => next(error));
        }
      });
  } else {
    res.json(result.error);
  }
});

router.get('/login', (req, res) => {
  res.send('Yo! This is the login route');
});

module.exports = router;