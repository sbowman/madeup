/** @module remote **/

import {RemoteVehicleService} from './remote.js';
import {MadeupMotorsService} from './madeup_motors.js';

/**
 * Create a new service instance based on the Smartcar identifier.  Currently
 * the only value supported is "madeup_motors" in anticipation of additional
 * services being made available in the future.
 *
 * If the identifier does not exist, the server will exit with an error code 1.
 *
 * @module remote
 * @function identifyService
 *
 * @param {string} identifier the unique service identifier, as defined by Smartcar
 * @param {string} host the full URL to the service's/manufacturer's REST API
 * @param {number} timeoutMs how long to wait for a reply from the remote service before aborting, in ms
 * @returns {RemoteVehicleService} the service layer implemented for the identifer
 */
export default function identifyService(identifier, host, timeoutMs) {
  switch (identifier) {
    case 'madeup_motors':
      console.log(`Connecting to Madeup Motors @ ${host}...`);
      return new MadeupMotorsService(host, timeoutMs);

    default:
      console.log(`Invalid service, ${identifier}; supported values are "madeup_motors"`);
      process.exit(1);
  }
}