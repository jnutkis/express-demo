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
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');

//Flash Middleware
app.use(flash());

//Dotenv Middleware
require('dotenv').config({ path: './secrets.env' });

//Response Local Vars
app.use(function(req, res, next) {
  res.locals.user = req.user || null;
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
require('./models/User');
const Item = mongoose.model('items');

//Route Import
const mongRoute = require('./routes/mongoose');
const userRoute = require('./routes/users');
const courseRoute = require('./routes/courses');

//DB Info Import
const dbConfig = require('./config/db');

//Mongoose Connect
mongoose.connect(dbConfig.mongoURI, () => {
  console.log(`DB Connected`);
});

//Express Session Middleware
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      url: dbConfig.mongoURI
    })
  })
);

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

//Passport Middleware
require('./config/passport')();
app.use(passport.initialize());
app.use(passport.session());

//Response Local Vars
app.use(function(req, res, next) {
  res.locals.user = req.user || null;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

//Custom Middleware
// require('./helpers/headers')(app);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Routes
app.use('/mongoose', mongRoute);
app.use('/user', userRoute);
app.use('/api/courses', courseRoute);

// PORT
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
