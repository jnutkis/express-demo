const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

//User Schema
const User = mongoose.model('users');

function local() {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email'
      },
      (username, password, done) => {
        User.findOne({ email: username })
          .then(user => {
            if (!user) {
              return done(null, false, { message: 'No User Found' });
            }
            bcrypt.compare(password, user.password, function(err, res) {
              if (err) {
                return done(err);
              }

              if (!res) {
                return done(null, false, { message: 'Password Incorrect' });
              } else {
                return done(null, user);
              }
            });
          })
          .catch(err => {
            return done(err);
          });
      }
    )
  );
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}

module.exports = local;
