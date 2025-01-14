import fetch from 'node-fetch';

import {RemoteVehicleService, VehicleInfo} from './remote.js';
import {ErrorResponse} from '../errors.js';

/**
 * Interface with the Madeup Motors company's REST API to pull information from
 * their service and translate it into the Smartcar API.
 */
export default class MadeupMotorsService extends RemoteVehicleService {
  constructor(host) {
    super(host);
  }

  async getVehicleInfo(id) {
    const resp = await this.post('/v1/getVehicleInfoService', new VehicleInfoRequest(id));
    const madeup = await resp.json();

    if (madeup.status === "200") {
      return new VehicleInfo(
        this.#getString(madeup, 'vin'),
        this.#getString(madeup, 'color'),
        this.#getDoorCount(madeup),
        this.#getString(madeup, 'driveTrain')
      );
    }

    return this.#parseError(madeup);
  }

  async getSecurity(id) {
    super.getSecurity(id);
  }

  async getFuelRange(id) {
    super.getFuelRange(id);
  }

  async getBatteryRange(id) {
    super.getBatteryRange(id);
  }

  async startEngine(id) {
    super.startEngine(id);
  }

  async stopEngine(id) {
    super.stopEngine(id);
  }

  /**
   * Post a request to the Madeup Motors REST API.
   *
   * @param {string} path remote service endpoint, e.g. "/v1/getVehicleInfoService"
   * @param {Object} request the JSON object with the request information such as ID
   * @returns {Promise<Response>} the response from the web service
   */
  post(path, request) {
    return fetch(`${this.host}${path}`, {
      method: 'post',
      body: JSON.stringify(request),
      headers: {'Content-Type': 'application/json'}
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
      return parseInt(madeup['data'][key]['value']);
    }

    return null;
  }

  // Transform an error response from Madeup Motors API into a Smartcar error
  // response.
  #parseError(body) {
    return new ErrorResponse(body['status'], body['reason'])
  }
}

class VehicleInfoRequest {
  constructor(id) {
    this.id = id;
    this.responseType = 'JSON';
  }
}
