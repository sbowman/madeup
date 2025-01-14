/** @module routes **/

import express from "express";

import {getBatteryRange, getDoors, getFuelRange, getVehicleInfo, postStartStopEngine} from "./handlers.js";
import {RemoteVehicleService} from './remote/remote.js';
import {ErrorResponse} from './errors.js';

/**
 * Create the Express routes for the given service, such as the
 * MadeupMotorsService.
 *
 * @module routes
 * @function createRoutes
 *
 * @param {RemoteVehicleService} service a service for forwarding requests to a remote manufacturer's API
 * @returns {Express} a reference to the express server with the configured routes
 */
export default function createRoutes(service) {
  const server = express();

  server.get("/vehicles/:id", getVehicleInfo(service));
  server.get("/vehicles/:id/doors", getDoors(service));
  server.get("/vehicles/:id/fuel", getFuelRange(service));
  server.get("/vehicles/:id/battery", getBatteryRange(service));

  server.post("/vehicles/:id/engine", postStartStopEngine(service));

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
