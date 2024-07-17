require('dotenv').config(); // Load environment variables from .env file
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { engine } = require('express-handlebars');
var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
const mongoose = require('mongoose');

const app = express(); // Create an Express application

/**
 * Make MongoDB connection
 */
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/lms'; // Default to local MongoDB if DB_URL is not provided

// Async function to connect to MongoDB
(async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true, // Use the new URL string parser
      useCreateIndex: true, // Use createIndex() instead of ensureIndex()
      useUnifiedTopology: true, // Use the new unified topology engine
    });
    console.log('MongoDB connected'); // Log success message on connection
  } catch (error) {
    console.error('MongoDB connection error:', error); // Log error message on connection failure
    process.exit(1); // Exit application on connection failure
  }
})();

/**
 * View engine setup
 */
app.engine('hbs', engine({ defaultLayout: 'layout', extname: '.hbs' })); // Set up Handlebars view engine with default layout and .hbs extension
app.set('view engine', 'hbs'); // Set view engine to Handlebars

app.use(logger('dev')); // Use morgan logger middleware in development mode
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Middleware to parse URL-encoded request bodies
app.use(cookieParser()); // Middleware to parse cookies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" directory

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })); // Middleware to parse URL-encoded request bodies

// parse application/json
app.use(bodyParser.json()); // Middleware to parse JSON request bodies

app.use('/', indexRouter); // Use indexRouter for the root route

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404)); // Forward 404 errors to the error handler
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message; // Set error message
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // Set error details only in development

  // render the error page
  res.status(err.status || 500); // Set response status to error status or 500
  res.render('error'); // Render the error page
});

const PORT = process.env.PORT || 5000; // Set the port from environment variables or default to 5000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // Log message indicating the server is running
});
