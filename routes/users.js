const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Joi = require('joi');
const bcrypt = require('bcrypt');

//Import User Schema
const User = mongoose.model('users');

router.get('/signup', (req, res) => {
  res.send('Worked');
});

router.post('/signup', (req, res) => {
  //Check to see if email exists
  User.findOne({ email: req.body.email })
    .then(data => {
      if (data) {
        return res.send('User Exists');
      } else {
        //Joi Schema
        const schema = {
          firstName: Joi.string()
            .min(5)
            .required()
            .label('First Name'),
          lastName: Joi.string()
            .min(5)
            .required()
            .label('Last Name'),
          email: Joi.string()
            .email()
            .required(),
          password: Joi.string()
            .min(5)
            .required()
        };
        //End Joi Schema

        //Joi Validate
        const joiResult = Joi.validate(req.body, schema);
        //End Joi Validate

        //If Joi Fails
        if (joiResult.error) {
          return res.status(404).send(joiResult.error.details[0].message);
        }
        //End Joi Check

        //Salt Password
        bcrypt.genSalt(10, function(err, salt) {
          if (err) {
            return res.send('Salt Error');
          }
          bcrypt.hash(req.body.password, salt, function(err, hash) {
            if (err) {
              return res.send('Hash Error');
            }
            //User Data
            const newUser = {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
              password: hash
            };
            //End User Data

            //Add User to DB
            new User(newUser)
              .save()
              .then(() => console.log('User Added'))
              .catch(e => res.send(e));
            console.log(hash);
          });
        });

        res.send('Worked');
      }
    })
    .catch(e => res.send(e));
  //End Check for Email
});

module.exports = router;
