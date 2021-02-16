import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import Debug from 'debug';
import fs from 'fs';
import http from 'http';
import https from 'https';

import apiRouter from './routes/api';

const debug = Debug('space:server');
const app = express();

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/** ********************************************************************
 *
 * Routes. All Routes should go before the error handler
 *
 ********************************************************************* */
app.use('/', apiRouter);

app.get('/', (req, res) => {
  res.send("Welcome to Renfrew's Space REST API Microservice");
});

/** ********************************************************************
 *
 * Error handler
 *
 ********************************************************************* */

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use(errorHandler);

/** ********************************************************************
 *
 * Server Start up
 *
 ********************************************************************* */
type Port = number | string | boolean;

let port: Port;
let server: http.Server | https.Server;

debug(`Running on '${process.env.NODE_ENV}' environment`);

// Start HTTPS server on production and test mode
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
  const privateKey = fs.readFileSync(
    `/etc/letsencrypt/live/${process.env.DOMAIN}/privkey.pem`,
    'utf8'
  );

  const certificate = fs.readFileSync(
    `/etc/letsencrypt/live/${process.env.DOMAIN}/cert.pem`,
    'utf8'
  );

  const ca = fs.readFileSync(
    `/etc/letsencrypt/live/${process.env.DOMAIN}/chain.pem`,
    'utf8'
  );

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca,
  };

  port = normalizePort(process.env.PORT || '443');
  server = https.createServer(credentials, app);

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
} else {
  // On development mode, use the http server
  port = normalizePort(process.env.PORT || '3000');
  server = http.createServer(app);

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
}

/** ********************************************************************
 *
 * Helper functions
 *
 ********************************************************************* */

/**
 * Error handler
 */
function errorHandler(
  err: createError.HttpError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  // send the error
  res.status(err.status || 500).send(err);
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string): Port {
  const ret_port = parseInt(val, 10);

  if (Number.isNaN(ret_port)) {
    // named pipe
    return val;
  }

  if (ret_port >= 0) {
    // port number
    return ret_port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      // eslint-disable-next-line no-console
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      // eslint-disable-next-line no-console
      console.error(`${bind} is already in use`);
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
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
  debug(`Listening on ${bind}`);
}
