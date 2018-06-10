const express = require('express');
const router = express.Router();
const Joi = require('joi');

const courses = [
  { id: 1, name: 'Course 1' },
  { id: 2, name: 'Course 2' },
  { id: 3, name: 'Course 3' }
];

router.get('/', (req, res) => {
  res.send([1, 2, 3]);
});

router.post('/', (req, res) => {
  const schema = {
    name: Joi.string()
      .min(3)
      .required()
  };
  const result = Joi.validate(req.body, schema);

  console.log(result);

  if (result.error) {
    //400 Bad Request
    return res.status(400).send(result.error.details[0].message);
  }

  const course = {
    id: courses.length + 1,
    name: req.body.name
  };

  courses.push(course);
  res.send(course);
});

router.put('/:id', (req, res) => {
  //Find ID from Param
  const course = courses.find(c => c.id === parseInt(req.params.id));
  //If can't find course, return 404
  if (!course) {
    return res.status(404).send(`Course not found with id ${req.params.id}`);
  }

  //If Put Form has error
  const { error } = validateCourse(req.body);
  if (error) {
    //400 Bad Request
    return res.status(400).send(error.details[0].message);
  }

  course.name = req.body.name;
  res.send(course);
});

function validateCourse(course) {
  const schema = {
    name: Joi.string()
      .min(3)
      .required()
  };
  return Joi.validate(course, schema);
}

router.delete('/:id', (req, res) => {
  //Find ID from Param
  const course = courses.find(c => c.id === parseInt(req.params.id));
  //If can't find course, return 404
  if (!course) {
    return res.status(404).send(`Course not found with id ${req.params.id}`);
  }

  const index = courses.indexOf(course);
  courses.splice(index, 1);

  res.send(course);
});

router.get('/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) {
    return res.status(404).send(`Course not found with id ${req.params.id}`);
  }
  res.setHeader('Content-Type', 'application/json');
  res.send(course);
});

module.exports = router;
