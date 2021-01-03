const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
// router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
// router.post('/register', (req, res) => {
//   const { name, email, password, password2 } = req.body;
//   let errors = [];
//
//   if (!name || !email || !password || !password2) {
//     errors.push({ msg: 'Please enter all fields' });
//   }
//
//   if (password !== password2) {
//     errors.push({ msg: 'Passwords do not match' });
//   }
//
//   if (password.length < 6) {
//     errors.push({ msg: 'Password must be at least 6 characters' });
//   }
//
//   if (errors.length > 0) {
//     res.render('register', {
//       errors,
//       name,
//       email,
//       password,
//       password2
//     });
//   } else {
//     User.findOne({ email: email }).then(user => {
//       if (user) {
//         errors.push({ msg: 'Email already exists' });
//         res.render('register', {
//           errors,
//           name,
//           email,
//           password,
//           password2
//         });
//       } else {
//         const newUser = new User({
//           name,
//           email,
//           password
//         });
//
//         bcrypt.genSalt(10, (err, salt) => {
//           bcrypt.hash(newUser.password, salt, (err, hash) => {
//             if (err) throw err;
//             newUser.password = hash;
//             newUser
//               .save()
//               .then(user => {
//                 req.flash(
//                   'success_msg',
//                   'You are now registered and can log in'
//                 );
//                 res.redirect('/users/login');
//               })
//               .catch(err => console.log(err));
//           });
//         });
//       }
//     });
//   }
// });

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

// Reset PW Page
router.get('/reset', ensureAuthenticated, (req, res) => res.render('reset', { errors: [], email: '', currPW: '', newPW: '', newPW2: ''}));

// Reset PW
router.post('/reset', (req, res) => {
  const { email, currPW, newPW, newPW2 } = req.body;
  let errors = [];

  if (!email || !currPW || !newPW || !newPW2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (newPW !== newPW2) {
    errors.push({ msg: 'New passwords do not match' });
  }

  if (newPW.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('reset', {
      errors,
      email,
      currPW,
      newPW,
      newPW2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        bcrypt.compare(currPW, user.password, (err, result) => {
          if (err) {
            throw err;
          } else if (result) {
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newPW, salt, (err, hash) => {
                if (err) throw err;
                user.password = hash;
                user.save()
                    .then(user => {
                        req.flash(
                            'success_msg',
                            'Your password has been reset'
                        );
                        res.redirect('/dashboard');
                      })
                    .catch(err => console.log(err));
              });
            });
          } else {
            errors.push({ msg: 'Current password does not match our records' })
            res.render('reset', {
              errors,
              email,
              currPW,
              newPW,
              newPW2
            });
          }
        })
      } else {
        errors.push('Sorry, we could not find your account. Please re-enter your email');
        res.render('reset', {
          errors,
          email,
          currPW,
          newPW,
          newPW2
        });
      }
    });
  }
})

module.exports = router;

