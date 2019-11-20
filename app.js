var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var apiRouter = require("./routes/api");

const fs = require("fs");
const passport = require("passport");
const SamlStrategy = require("passport-saml").Strategy;
const session = require("express-session");

// Load dev config if suitable.
try {
  let config = require("./config.json");
  for (var prop in config) {
    if (config.hasOwnProperty(prop)) {
      process.env[prop] = config[prop];
    }
  }
} catch (err) {
  console.error("No local config present.");
}

var SAML_CERT;
var SAML_PRIVATE_KEY;

if (process.env.USE_SAML) {
  SAML_CERT = fs.readFileSync(process.env.CERTFILE_PATH, "utf-8");
  SAML_PRIVATE_KEY = fs.readFileSync(process.env.KEYFILE_PATH, "utf-8");
}

const samlStrategy = new SamlStrategy({
  callbackUrl: process.env.SAML_CALLBACK,
  entryPoint: process.env.IDP_ENTRYPOINT,
  issuer: process.env.SAML_ISSUER,
  acceptedClockSkewMs: -1,
  decryptionPvk: SAML_PRIVATE_KEY,
  cert: [ process.env.IDP1_CERT, process.env.IDP2_CERT ],
  identifierFormat: null
}, (profile, done) => {
  let profileIdPropertyName = process.env.PROFILE_PROPERTY_FOR_ID || 
    "urn:oid:1.3.6.1.4.1.5923.1.1.1.6";
  return done(null, { id: profile[profileIdPropertyName] })
});
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
passport.use(samlStrategy);

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.get("/saml/MetaData", (req, res) => {
  res.type("application/xml");
  res.send(samlStrategy.generateServiceProviderMetadata(SAML_CERT));
});
app.post("/login_callback", 
  passport.authenticate("saml", {
    failureRedirect: "login_error.html",
    failureFlash: true
  }),
  (req, res) => {
    res.redirect("/");
  });
app.use(express.static(path.join(__dirname, 'public')));
app.use("/api", apiRouter);

var debug = require('debug')('30dc:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


module.exports = app;
