const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
// router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));


router.get('/', (req, res, next) => {
  console.log('===== user!!======')
  console.log(req.user)
  if (req.user) {
      res.json({ user: req.user })
  } else {
      res.json({ user: null })
  }
})

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>{
  res.render('dashboard', {
    user: req.user
  })
});

module.exports = router;
