const router = require('express').Router();
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const db = require('../db/connection');
const users = db.get('users');

const registerSchema = Joi.object().keys({
  firstName: Joi.string().alphanum().min(3).max(30).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
  email: Joi.string().email({ minDomainSegments: 2 }),
});

const loginSchema = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
});

function responseError(res, next, statusCode) {
  res.status(statusCode);
  const error = new Error("Sorry, Request can't be processed");
  next(error);
}

function createToken_sendResponse(res, next, user) {
  jwt.sign(
    { _id: user._id },
    process.env.TOKEN_SECRET,
    { expiresIn: '1d' },
    (err, token) => {
      if (err) {
        next(err);
      } else {
        res.json({ user, token });
      }
    }
  );
}

//Routes
router.get('/signup', (req, res, next) => {
  res.send('Welcome to the Signup route');
});

router.post('/signup', (req, res, next) => {
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
          res.json('User exists already');
          next(error);
        } else {
          bcrypt
            .hash(req.body.password.trim(), saltRounds)
            .then((hashedPassword) => {
              const newUser = {
                firstName: req.body.firstName,
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
              };
              users
                .insert(newUser)
                .then((addedUser) => {
                  delete addedUser.password;
                  createToken_sendResponse(re, next, addedUser);
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

router.post('/login', (req, res, next) => {
  // validate rather than validateAsync since the ...
  const result = loginSchema.validate(req.body);
  if (!result.error) {
    users
      .findOne({
        username: req.body.username,
      })
      .then((user) => {
        if (user) {
          bcrypt.compare(req.body.password, user.password).then((result) => {
            if (result === true) {
              const payload = {
                _id: user._id,
                firstname: user.firstname,
                username: user.username,
                email: user.email,
              };
              delete user.password;
              createToken_sendResponse(res, next, payload);
            } else {
              responseError(res, next, 422);
            }
          });
        } else {
          responseError(res, next, 422);
        }
      });
  } else {
    responseError(res, next, 422);
  }
});

module.exports = router;
