/** @module routes **/

import express from 'express';
import promBundle from 'express-prom-bundle';

import {getBatteryRange, getDoors, getFuelRange, getVehicleInfo, postStartStopEngine} from './handlers.js';
import {RemoteVehicleService} from './remote/remote.js';
import {ErrorResponse} from './errors.js';

/**
 * Create the Express routes for the given service, such as the
 * MadeupMotorsService.
 *
 * Enables endpoint metrics via Prometheus using the `express-prom-bundle`. Each
 * metric should be labeled with the `instance`, configured via the `HOSTNAME`
 * environment variable, and the `service` identifier, such as "madeup_motors."
 *
 * @module routes
 * @function createRoutes
 *
 * @param {RemoteVehicleService} service a service for forwarding requests to a remote manufacturer's API
 * @returns {Express} a reference to the express server with the configured routes
 */
export default function createRoutes(service) {
  const server = express();

  server.use(express.json());

  // express.json() throws an error if the JSON is bad; let's trap that...
  server.use((err, req, res, next) => {
    if (err) {
      res.status(400).send(new ErrorResponse('400', `Unable to parse the request's JSON body: ${err['message']}`))
    } else {
      next()
    }
  })

  const labels = {};
  if (process.env.HOSTNAME) {
    labels['instance'] = process.env.HOSTNAME;
  }

  labels['service'] = service.name;

  const metrics = promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    customLabels: labels,
    promClient: {
      collectDefaultMetrics: {
        labels: labels,
      }
    }
  });
  server.use(metrics);


  server.get('/vehicles/:id', getVehicleInfo(service));
  server.get('/vehicles/:id/doors', getDoors(service));
  server.get('/vehicles/:id/fuel', getFuelRange(service));
  server.get('/vehicles/:id/battery', getBatteryRange(service));

  server.post('/vehicles/:id/engine', postStartStopEngine(service));

  server.use(errorHandler);

  return server;
}

const errorHandler = (req, res, next) => {
  if (res.headersSent) {
    next();
  } else {
    res.status(404).send(new ErrorResponse('404', 'That endpoint does not exist.'));
  }
}
