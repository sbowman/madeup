import winston from 'winston';

import configureServer from './settings.js';
import identifyService from './remote/identifier.js';
import createRoutes from './routes.js';

const settings = configureServer();

const {combine, colorize, timestamp, json, printf} = winston.format;
const cli = combine(
  colorize({all: true}),
  timestamp({
    format: 'YYYY-MM-DD hh:mm:ss.SSS A',
  }),
  printf((log) => {
    let msg = '';
    for (const prop in log) {
      if (prop !== 'level' && prop !== 'message' && prop !== 'timestamp') {
        msg += `${prop}=${log[prop]}`;
      }
    }

    return `${log.timestamp} [${log.level}] ${log.message} ${msg}`
  }));

const transport = settings.logFile &&
  new winston.transports.File({filename: settings.logFile}) ||
  new winston.transports.Console()

const logger = winston.createLogger({
  level: settings.logLevel,
  format: settings.logFile && combine(timestamp(), json()) || cli,
  transports: [transport],
});

const service = identifyService(settings.service, settings.serviceHost, settings.serviceTimeoutMs, logger);

const server = createRoutes(service);
server.listen(settings.port, () => {
  logger.info('The server is online and accepting requests', {port: settings.port});
});


