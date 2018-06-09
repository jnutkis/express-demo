const express = require('express');
const app = express();
const Joi = require('joi');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');
const startupDebugger = require('debug')('app:startup');

//Dotenv Middleware
require('dotenv').config({ path: './secrets.env' });

//Response Local Vars
app.use(function(req, res, next) {
  res.locals.user = 'James Nutkis';
  res.locals.authenticated = false;
  next();
});

//Helmet Middleware
app.use(helmet());

if (app.get('env') === 'development') {
  //Morgan Middleware
  app.use(morgan('tiny'));
  startupDebugger('Morgan Enabled');
}

//Config
// console.log('Application Name ' + config.get('name'));
// console.log('Application Mail ' + config.get('mail.host'));
// console.log('Mail Password ' + config.get('mail.password'));

//Schema Import
require('./models/Item');
const Item = mongoose.model('items');

//Route Import
const mongRoute = require('./routes/mongoose');

//DB Info Import
const dbConfig = require('./config/db');

//Mongoose Connect
mongoose.connect(dbConfig.mongoURI, () => {
  console.log(`DB Connected`);
});

//Bodyparser Middlware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Handlebars Middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//MethodOverride Middlware
app.use(methodOverride('_method'));

//Materialize Static
app.use(
  '/material',
  express.static(__dirname + '/node_modules/materialize-css/dist')
);

//Public Static
app.use(express.static(path.join(__dirname, 'public')));

//jQuery Static
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));

//Custom Middleware
// require('./helpers/headers')(app);

const courses = [
  { id: 1, name: 'Course 1' },
  { id: 2, name: 'Course 2' },
  { id: 3, name: 'Course 3' }
];

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/courses', (req, res) => {
  res.send([1, 2, 3]);
});

app.post('/api/courses', (req, res) => {
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

app.put('/api/courses/:id', (req, res) => {
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

app.delete('/api/courses/:id', (req, res) => {
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

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) {
    return res.status(404).send(`Course not found with id ${req.params.id}`);
  }
  res.send(course);
});

// Routes
app.use('/mongoose', mongRoute);

// PORT
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
