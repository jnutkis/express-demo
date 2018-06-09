const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Joi = require('joi');
const methodOverride = require('method-override');
const path = require('path');

//MethodOverride Middlware
router.use(methodOverride('_method'));

router.use(express.json());

//Item Schema
const Item = mongoose.model('items');

//Get Items
router.get('/', (req, res) => {
  res.set('james', 'is a beast');

  Item.find({}).then(data => {
    const names = [];
    data.forEach(item => {
      names.push(item);
    });

    res.render('mongoose/index', {
      names: names
    });
  });
});

router.post('/new', (req, res) => {
  //Validate Forms using Joi
  const schema = {
    name: Joi.string()
      .min(3)
      .max(255)
      .required(),
    data: Joi.string()
      .min(3)
      .max(255)
      .required()
  };

  const itemData = {
    name: req.body.name,
    data: req.body.data
  };

  const result = Joi.validate(itemData, schema);

  if (result.error) {
    return res.send(result.error);
  }

  new Item(itemData)
    .save()
    .then(data => {
      res.redirect('/mongoose');
    })
    .catch(e => {
      throw e;
    });
});

router.put('/item/:id', (req, res) => {
  //Validate Forms using Joi
  const schema = {
    name: Joi.string()
      .min(3)
      .max(255)
      .required(),
    data: Joi.string()
      .min(3)
      .max(255)
      .required()
  };

  const itemData = {
    name: req.body.name,
    data: req.body.data
  };

  const result = Joi.validate(itemData, schema);

  if (result.error) {
    return res.send(result.error);
  }

  Item.findOne({ _id: req.params.id })
    .update({
      name: req.body.name,
      data: req.body.data
    })
    .then(data => {
      res.redirect(`/mongoose/item/${req.params.id}`);
    })
    .catch(e => {
      throw e;
    });
});

//Get One Item
router.get('/item/:id', (req, res) => {
  Item.findOne({ _id: req.params.id })
    .then(data => {
      res.render('mongoose/item', {
        data: data
      });
    })
    .catch(e => res.status(404).send('An error has occurred'));
});

//Delete One Item
router.delete('/item/:id', (req, res) => {
  //Find Item
  Item.findByIdAndRemove(req.params.id)
    .then(data => {
      res.redirect('/mongoose');
    })
    .catch(e => {
      console.log(e);
      res.send(e);
    });
});

//Create New Item
router.get('/new', (req, res) => {
  res.render('mongoose/new');
});

module.exports = router;
