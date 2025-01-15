/** @module handlers **/

import {ErrorResponse} from './errors.js';
import {RemoteVehicleService} from './remote/remote.js';

/**
 * Get detailed information about the vehicle.  Expects an "id" parameter
 * indicating the remote service's internal ID for the vehicle.
 *
 * @module handlers
 * @function getVehicleInfo
 *
 * @param {RemoteVehicleService} service the service to use for making the request
 * @returns {function} a function to use in the Express handler
 */
export const getVehicleInfo = (service) => {
  return async (req, res) => {
    const id = req.params['id'];

    if (id === undefined) {
      res.status(400).send(new ErrorResponse('400', 'A vehicle ID is required.'));
      return;
    }

    const info = await service.getVehicleInfo(id);
    const {error: error, code: code} = isError(info);
    if (error) {
      res.status(code).send(info);
      return;
    }

    res.send(info);
  }
}

/**
 * Check which doors are locked on the vehicle.  Expects an "id" parameter
 * indicating the remote service's internal ID for the vehicle.
 *
 * @module handlers
 * @function getDoors
 *
 * @param {RemoteVehicleService} service the service to use for making the request
 * @returns {function} a function to use in the Express handler
 */
export const getDoors = (service) => {
  return async (req, res) => {
    const id = req.params['id'];

    if (id === undefined) {
      res.status(400).send(new ErrorResponse('400', 'A vehicle ID is required.'));
      return;
    }

    const info = await service.getSecurity(id);
    const {error: error, code: code} = isError(info);
    if (error) {
      res.status(code).send(info);
      return;
    }

    res.send(info);
  }
}

/**
 * Look up the fuel range of a vehicle.  Expects an "id" parameter indicating
 * the remote service's internal ID for the vehicle.
 *
 * If this is an electric vehicle, will return a range of `0.0`.  Best to
 * check the `driveTrain` of the vehicle before calling this function and only
 * using this call on vehicles with a `driveTrain` other than "electric."
 *
 * @module handlers
 * @function getFuelRange
 *
 * @param {RemoteVehicleService} service the service to use for making the request
 * @returns {function} a function to use in the Express handler
 */
export const getFuelRange = (service) => {
  return async (req, res) => {
    const id = req.params['id'];

    if (id === undefined) {
      res.status(400).send(new ErrorResponse('400', 'A vehicle ID is required.'));
      return;
    }

    const range = await service.getFuelRange(id);
    const {error: error, code: code} = isError(range);
    if (error) {
      res.status(code).send(range);
      return;
    }

    res.send(range);
  }
}

/**
 * Look up the battery range of a vehicle.  Expects an "id" parameter indicating
 * the remote service's internal ID for the vehicle.
 *
 * If this is a gas-powered vehicle, will return a range of `0.0`.  Best to
 * check the `driveTrain` of the vehicle before calling this function and only
 * using this call on vehicles with a `driveTrain` of "electric."
 *
 * @module handlers
 * @function getBatteryRange
 *
 * @param {RemoteVehicleService} service the service to use for making the request
 * @returns {function} a function to use in the Express handler
 */
export const getBatteryRange = (service) => {
  return async (req, res) => {
    const id = req.params['id'];

    if (id === undefined) {
      res.status(400).send(new ErrorResponse('400', 'A vehicle ID is required.'));
      return;
    }

    const range = await service.getBatteryRange(id);
    const {error: error, code: code} = isError(range);
    if (error) {
      res.status(code).send(range);
      return;
    }

    res.send(range);
  }
}

/**
 * Remote start or stop the vehicle.  Expects an "id" parameter indicating
 * the remote service's internal ID for the vehicle.
 *
 * @module handlers
 * @function postStartStopEngine
 *
 * @param {RemoteVehicleService} service the service to use for making the request
 * @returns {function} a function to use in the Express handler
 */
export const postStartStopEngine = (service) => {
  return async (req, res) => {
    const id = req.params['id'];

    if (id === undefined) {
      res.status(400).send(new ErrorResponse('400', 'A vehicle ID is required.'));
      return;
    }

    let result;

    const body = req.body;
    switch (body['action']) {
      case 'START':
        result = await service.startEngine(id);
        break;

      case 'STOP':
        result = await service.stopEngine(id);
        break;

      default:
        res.status(400).send(new ErrorResponse('400', 'Requires an "action" in the request of either "START" or "STOP"'));
        return;
    }

    const {error: error, code: code} = isError(result);
    if (error) {
      res.status(code).send(result);
      return;
    }

    res.send(result);
  }
}

// Check if the response is an error, and if the error code is compatible with
// an HTTP response code.  Returns {error: <true|false>, code: <number>}, with
// the code meant to be the HTTP response code for the handler.
//
// If code is less than 400 or greater than 599, returns a 400 HTTP response.
const isError = (object) => {
  if (object instanceof ErrorResponse) {
    if (object.code < 400 || object.code > 599) {
      return {error: true, code: 400};
    }

    return {error: true, code: object.code};
  }

  return {error: false, code: 0};
}
