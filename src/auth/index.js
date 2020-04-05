const router = require('express').Router();

router.get('/register', (req, res) => {
  res.send('Welcome to the Register route');
});
router.get('/login', (req, res) => {
  res.send('Yo! This is the login route');
});

module.exports = router;
