/** @module remote **/

import winston from 'winston';

import {Range, Door, DoorSecurity, RemoteVehicleService, VehicleInfo, EngineStatus, Status} from './remote.js';
import {ErrorResponse} from '../errors.js';
import {latency} from './metrics.js';

/**
 * Interface with the Madeup Motors company's REST API to pull information from
 * their service and translate it into the Smartcar API.
 */
export class MadeupMotorsService extends RemoteVehicleService {
  /**
   * @constructor
   * @param {string} host the Madeup Motors API URL
   * @param {number} [timeoutMs=5000] how long to wait for the Madeup Motors API to reply, in ms
   * @param {winston.Logger} [logger=winston] for logging any errors
   */
  constructor(host, timeoutMs, logger) {
    super('madeup_motors', host, timeoutMs);
    this.logger = logger || winston;
  }

  /**
   * Fetch the vehicle's details.
   *
   * @param id unique Madeup Motors identifier for the vehicle
   * @returns {Promise<VehicleInfo|ErrorResponse>} the response transformed into the Smartcar API
   */
  async getVehicleInfo(id) {
    try {
      const start = Date.now();

      const resp = await this.#post('/v1/getVehicleInfoService', new VehicleRequest(id));
      const madeup = await resp.json();

      const end = Date.now()
      latency.observe({
        instance: this.instance,
        service: this.name,
        endpoint: '/v1/getVehicleInfoService'
      }, (end - start) / 1000.0);

      if (madeup.status === '200') {
        const info = new VehicleInfo(
          this.#getString(madeup, 'vin'),
          this.#getString(madeup, 'color'),
          this.#getDoorCount(madeup),
          this.#getString(madeup, 'driveTrain')
        );

        if (info.vin) {
          return info;
        }

        return new ErrorResponse('503', 'Madeup Motors did not return the expected response; did the API change?');
      }

      return this.#parseError(madeup);
    } catch (error) {
      return this.#isTimeoutError(error);
    }
  }

  /**
   * Look up which doors are locked.
   *
   * @param id unique Madeup Motors identifier for the vehicle
   * @returns {Promise<DoorSecurity|ErrorResponse>} the response transformed into the Smartcar API
   */
  async getSecurity(id) {
    try {
      const start = Date.now();

      const resp = await this.#post('/v1/getSecurityStatusService', new VehicleRequest(id));
      const madeup = await resp.json();

      const end = Date.now()
      latency.observe({
        instance: this.instance,
        service: this.name,
        endpoint: '/v1/getSecurityStatusService'
      }, (end - start) / 1000.0);

      if (madeup.status === "200") {
        const doors = this.#getArray(madeup, 'doors');
        if (doors) {
          return new DoorSecurity(doors.map((entry) => {
            const location = entry["location"] && entry["location"]["value"];
            const locked = entry["locked"] && entry["locked"]["value"] === "True";

            return new Door(location, locked);
          }));
        }

        return new ErrorResponse('503', 'Madeup Motors did not return the expected response; did the API change?');
      }

      return this.#parseError(madeup);
    } catch (error) {
      return this.#isTimeoutError(error);
    }
  }

  /**
   * Look up the fuel range of the vehicle.
   *
   * If this is an electric vehicle, will return a 400 error suggested as much.
   * Best to check the `driveTrain` of the vehicle before calling this function
   * and only using this call on vehicles with a `driveTrain` other than
   * "electric."
   *
   * @param id unique Madeup Motors identifier for the vehicle
   * @returns {Promise<Range|ErrorResponse>} the range of the vehicle in percent of remaining fuel
   */
  async getFuelRange(id) {
    try {
      const start = Date.now();

      const resp = await this.#post('/v1/getEnergyService', new VehicleRequest(id));
      const madeup = await resp.json();

      const end = Date.now()
      latency.observe({
        instance: this.instance,
        service: this.name,
        endpoint: '/v1/getEnergyService'
      }, (end - start) / 1000.0);

      if (madeup.status === "200") {
        const range = this.#getNumber(madeup, 'tankLevel');

        if (!range) {
          if (this.#getNumber(madeup, 'batteryLevel')) {
            return new ErrorResponse('400', 'This vehicle failed to return fuel range information; is it electric?');
          } else {
            return new ErrorResponse('503', 'Madeup Motors did not return the expected response; did the API change?');
          }
        }

        return new Range(range);
      }

      return this.#parseError(madeup);
    } catch (error) {
      return this.#isTimeoutError(error);
    }
  }

  /**
   * Look up the battery range of the vehicle.
   *
   * If this is a gas-powered vehicle, will return a 400 error suggesting as
   * much.  Best to check the `driveTrain` of the vehicle before calling this
   * function and only using this call on vehicles with a `driveTrain` other
   * than "electric."
   *
   * @param id unique Madeup Motors identifier for the vehicle
   * @returns {Promise<Range|ErrorResponse>} the range of the vehicle in percent of remaining battery power
   */
  async getBatteryRange(id) {
    try {
      const start = Date.now();

      const resp = await this.#post('/v1/getEnergyService', new VehicleRequest(id));
      const madeup = await resp.json();

      const end = Date.now()
      latency.observe({
        instance: this.instance,
        service: this.name,
        endpoint: '/v1/getEnergyService'
      }, (end - start) / 1000.0);

      if (madeup.status === "200") {
        const range = this.#getNumber(madeup, 'batteryLevel');

        if (!range) {
          if (this.#getNumber(madeup, 'tankLevel')) {
            return new ErrorResponse('400', 'This vehicle failed to return battery range information; is it gas-powered?');
          } else {
            return new ErrorResponse('503', 'Madeup Motors did not return the expected response; did the API change?');
          }
        }

        return new Range(range);
      }

      return this.#parseError(madeup);
    } catch (error) {
      return this.#isTimeoutError(error);
    }
  }

  /**
   * Send a request to Madeup Motors to start this vehicle.
   *
   * @param id unique Madeup Motors identifier for the vehicle
   * @returns {Promise<EngineStatus|ErrorResponse>} with a "success" or "error" status
   */
  async startEngine(id) {
    try {
      const start = Date.now();

      const resp = await this.#post('/v1/actionEngineService', new VehicleCommand(id, 'START_VEHICLE'));
      const madeup = await resp.json();

      const end = Date.now()
      latency.observe({
        instance: this.instance,
        service: this.name,
        endpoint: '/v1/actionEngineService'
      }, (end - start) / 1000.0);

      if (madeup.status === "200") {
        return this.#interpretEngineStatus(madeup);
      }

      return this.#parseError(madeup);
    } catch (error) {
      return this.#isTimeoutError(error);
    }
  }

  /**
   * Send a request to Madeup Motors to stop this vehicle.
   *
   * @param id unique Madeup Motors identifier for the vehicle
   * @returns {Promise<EngineStatus|ErrorResponse>} with a "success" or "error" status
   */
  async stopEngine(id) {
    try {
      const start = Date.now();

      const resp = await this.#post('/v1/actionEngineService', new VehicleCommand(id, 'STOP_VEHICLE'));
      const madeup = await resp.json();

      const end = Date.now()
      latency.observe({
        instance: this.instance,
        service: this.name,
        endpoint: '/v1/actionEngineService'
      }, (end - start) / 1000.0);

      if (madeup.status === "200") {
        return this.#interpretEngineStatus(madeup);
      }

      return this.#parseError(madeup);
    } catch (error) {
      return this.#isTimeoutError(error);
    }
  }

  // Post a request to the Madeup Motors REST API.
  #post(path, request) {
    return fetch(`${this.host}${path}`, {
      method: 'post',
      body: JSON.stringify(request),
      headers: {'Content-Type': 'application/json'},
      signal: AbortSignal.timeout(this.timeoutMs),
    });
  }

  // Translates the Madeup Motors API indicating the number of doors into an
  // actual number of doors.
  #getDoorCount(madeup) {
    if (this.#getBoolean(madeup, 'fourDoorSedan')) {
      return 4;
    }

    if (this.#getBoolean(madeup, 'twoDoorCoupe')) {
      return 2;
    }

    return 0;
  }

  // Look up a data value in the Madeup Motors response that should be a string.
  // If the value doesn't exist or is not a string, returns null.
  #getString(madeup, key) {
    if (madeup['data'] && madeup['data'][key] && madeup['data'][key]['type'] === 'String' &&
      madeup['data'][key]['value'] && madeup['data'][key]['value'] !== '') {
      return madeup['data'][key]['value'];
    }

    return null;
  }

  // Look up a data value in the Madeup Motors response that should be a boolean
  // value and convert it to the boolean.  If the key is not present or is not
  // a "Boolean," returns null.
  #getBoolean(madeup, key) {
    if (madeup['data'] && madeup['data'][key] && madeup['data'][key]['type'] === 'Boolean' &&
      madeup['data'][key]['value']) {
      return madeup['data'][key]['value'] === 'True';
    }

    return null;
  }

  // Look up a data value in the Madeup Motors response that should be a number
  // value and convert it to a number type.  If the key is not present or is
  // not a "Number," returns null.
  #getNumber(madeup, key) {
    if (madeup['data'] && madeup['data'][key] && madeup['data'][key]['type'] === 'Number' &&
      madeup['data'][key]['value']) {
      return parseFloat(madeup['data'][key]['value']);
    }

    return null;
  }

  // Look up a data value in the Madeup Motors response that should be an array
  // of values and convert it to an arra.  If the key is not present or is
  // not an "Array," returns null.
  #getArray(madeup, key) {
    if (madeup['data'] && madeup['data'][key] && madeup['data'][key]['type'] === 'Array' &&
      madeup['data'][key]['values']) {
      return madeup['data'][key]['values'];
    }
  }

  // Transform an error response from Madeup Motors API into a Smartcar error
  // response.
  #parseError(body) {
    return new ErrorResponse(body['status'], body['reason'])
  }

  // Check the exception thrown from a fetch/#post and transform it into an
  // ErrorResponse.
  #isTimeoutError(error) {
    if (error) {
      if (error['name'] === 'TimeoutError') {
        return new ErrorResponse('503',
          `The Madeup Motors service did not respond in the expected amount of time (${this.timeoutMs} ms).`);
      }

      return new ErrorResponse('503', error['message']);
    } else {
      this.logger.error('Received an unrecognized error from Madeup Motors', {original: error});
      return new ErrorResponse('500', 'There was a problem with the server.')
    }
  }

  // Check the response from the server and convert that into a successful or
  // an "error" EngineStatus.
  #interpretEngineStatus(madeup) {
    if (madeup['actionResult'] && madeup['actionResult']['status'] === 'EXECUTED') {
      return new EngineStatus(Status.SUCCESS);
    } else if (madeup['actionResult'] && madeup['actionResult']['status']) {
      return new EngineStatus(Status.ERROR);
    } else {
      return new ErrorResponse('503', 'Madeup Motors did not return the expected response; did the API change?');
    }
  }
}

// Generates the JSON for a simple request to look up information about a
// vehicle by its ID.
class VehicleRequest {
  constructor(id) {
    this.id = id;
    this.responseType = 'JSON';
  }
}

// Generates the JSON to POST to the server when requesting to start or stop the
// engine.
class VehicleCommand {
  constructor(id, command) {
    this.id = id;
    this.command = command;
    this.responseType = 'JSON';
  }
}
