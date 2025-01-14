import express from "express";

import {getVehicleInfo} from "./handlers.js";
import {RemoteVehicleService} from './remote/remote.js';

/**
 * Create the Express routes for the given service, such as the
 * MadeupMotorsService.
 *
 * @param {RemoteVehicleService} service
 * @returns {Express} a reference to the express server with the configured routes
 */
export default function createRoutes(service) {
  const server = express();

  // Generates a path handled by the given service.
  server.get("/vehicles/:id", getVehicleInfo(service));

  return server;
}
