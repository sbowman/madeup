import {ErrorResponse} from './errors.js';
import {RemoteVehicleService} from './remote/remote.js';

/**
 * Get detailed information about the vehicle.  Expects an "id" parameter
 * indicating the remote service's internal ID for the vehicle.
 *
 * @param {RemoteVehicleService} service the service to use for making the request
 * @returns {(function(*, *): Promise<void>)|*} a function to use in the Express handler
 */
export const getVehicleInfo = (service) => {
  return async (req, res) => {
    const id = req.params["id"];

    if (id === undefined) {
      res.status(400).send(new ErrorResponse("400", "A vehicle ID is required."));
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

export const getSecurity = (req, res) => {

}

export const getFuelRange = (req, res) => {

}

export const getBatteryRange = (req, res) => {

}

export const getStartStopEngine = (req, res) => {

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
