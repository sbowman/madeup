/** @module remote **/

/**
 * Mimic an interface for remote auto service APIs such as Madeup Motors.  Note
 * that all the functions on the base class raise a "not implemented" exception.
 *
 * Classes extending this interface should make sure they don't implement any
 * state that can't be reused by multiple processes.  For example, it's ok to
 * keep a reference to a host endpoint or an authentication key, but don't fetch
 * something for a single request and store it as a property of the class unless
 * it's useful to other client requests.
 *
 * @property {string} name the identifier for this service
 * @property {string} host the URL to the service
 * @property {number} timeoutMs how long to wait for a response, in milliseconds
 * @property {string} instance hostname of this server; used for metrics
 */
export class RemoteVehicleService {
  /**
   * @constructor
   * @param {string} name the name of the service
   * @param {string} host the URL of the manufacturer's API
   * @param {number} [timeoutMs=5000] how long to wait for the remote service to reply, in ms
   */
  constructor(name, host, timeoutMs) {
    this.name = name;
    this.host = host;
    this.timeoutMs = timeoutMs || 5000;
    this.instance =  process.env.HOSTNAME;
  }

  /**
   * Get the details about the vehicle, such as its VIN or color.
   *
   * @param id the manufacturer's internal ID of the vehicle; does not have to correlate to the VIN!
   * @returns {Promise<VehicleInfo|ErrorResponse>} the details about the vehicle
   */
  async getVehicleInfo(id) {
    throw new Error('getVehicleInfo not implemented');
  }

  /**
   * Get the details about the doors and whether or not they're locked.
   *
   * @param id the manufacturer's internal ID of the vehicle; does not have to correlate to the VIN!
   * @returns {Promise<DoorSecurity|ErrorResponse>}
   */
  async getSecurity(id) {
    throw new Error('getSecurity not implemented');
  }

  /**
   * Get the percent fuel remaining in the vehicle.
   *
   * @param id the manufacturer's internal ID of the vehicle; does not have to correlate to the VIN!
   * @returns {Promise<Range|ErrorResponse>} the percent range remaining
   */
  async getFuelRange(id) {
    throw new Error('getFuelRange not implemented');
  }

  /**
   * Get the percent battery range remaining for the vehicle.
   *
   * @param id the manufacturer's internal ID of the vehicle; does not have to correlate to the VIN!
   * @returns {Promise<Range|ErrorResponse>} the percent range remaining
   */
  async getBatteryRange(id) {
    throw new Error('getBatteryRange not implemented');
  }

  /**
   * Start the vehicle's engine.
   *
   * @param id the manufacturer's internal ID of the vehicle; does not have to correlate to the VIN!
   * @returns {Promise<EngineStatus|ErrorResponse>} indicates if the engine was able to be started
   */
  async startEngine(id) {
    throw new Error('startEngine not implemented');
  }

  /**
   * Stop the vehicle's engine.
   *
   * @param id the manufacturer's internal ID of the vehicle; does not have to correlate to the VIN!
   * @returns {Promise<EngineStatus|ErrorResponse>} indicates if the engine was able to be stopped
   */
  async stopEngine(id) {
    throw new Error('stopEngine not implemented');
  }
}

/**
 * Defines the details of a vehicle returned by the Smartcar API.
 */
export class VehicleInfo {

  /**
   * @constructor
   * @param {string} vin the vehicle identification number
   * @param {string} color the exterior, primary color of the vehicle
   * @param {number} doorCount the number of doors on the vehicle
   * @param {string} driveTrain the vehicle's drive train, e.g. v8, electric, etc.
   */
  constructor(vin, color, doorCount, driveTrain) {
    this.vin = vin;
    this.color = color;
    this.doorCount = doorCount;
    this.driveTrain = driveTrain;
  }
}

/**
 * Describes the locked or unlocked state of a single door on the vehicle.
 */
export class Door {
  /**
   *
   * @param {string} location a description of the door's location, e.g. "frontRight"
   * @param {boolean} locked if true, the door is locked
   */
  constructor(location, locked) {
    this.location = location;
    this.locked = locked;
  }
}

/**
 * Describe the sum total of doors on the vehicle and their current locked or
 * unlocked state.
 */
export class DoorSecurity {
  /**
   * @constructor
   * @param {array} doors the collection of doors on the vehicle and their current state
   */
  constructor(doors) {
    this.doors = doors
  }

  /**
   * Convert the DoorSecurity information into a JSON string.
   *
   * Example:
   *
   *     [
   *       {
   *         "location": "frontLeft",
   *         "locked": true
   *       },
   *       {
   *         "location": "frontRight",
   *         "locked": true
   *       },
   *       {
   *         "location": "backLeft",
   *         "locked": true
   *       },
   *       {
   *         "location": "backRight",
   *         "locked": false
   *       }
   *     ]
   *
   * @returns {Array} the DoorSecurity JSON string
   */
  toJSON() {
    return this.doors.map(door => {
        return {
          location: door.location,
          locked: door.locked,
        }
      });
  }
}

/**
 * Range provides details about the remaining percentage range remaining on the
 * vehicle.  For a gas-powered vehicle, this is the remaining available petrol.
 * For an electric vehicle, it's the remaining available charge.
 */
export class Range {
  /**
   * @constructor
   * @param {number} percent the percent range remaining on the vehicle
   */
  constructor(percent) {
    this.percent = percent;
  }
}

/**
 * The status of the engine after an attempt to start or stop it.
 *
 * @type {Readonly<{SUCCESS: string, ERROR: string}>}
 * @see EngineStatus
 */
export const Status = Object.freeze({
  SUCCESS: "success",
  ERROR: "error",
});

/**
 * Engine status after trying to start or stop the car; did the action succeed,
 * or was there a problem (error)?
 */
export class EngineStatus {
  /**
   * @constructor
   * @param {string} status following the engine start or stop
   */
  constructor(status) {
    this.status = status;
  }
}
