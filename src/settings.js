/** @module settings **/

const defaultPort = 3000;
const defaultService = 'madeup_motors';
const defaultServiceHost = 'https://platform-challenge.smartcar.com';
const defaultServiceTimeoutMs = 3000;

/**
 * Settings defines the configurable properties of this REST server.
 *
 * @property {number} port the port to listen to for requests
 * @property {string} service the service identifier for the remote manufacturer's API
 * @property {string} serviceHost the remote manufacturer's full REST URL
 * @property {string} serviceTimeoutMs how long to wait for a response from the service, in milliseconds
 */
export class Settings {

  /**
   * @constructor
   * @param {number} port the port to listen to for requests
   * @param {string} service the service identifier for the remote manufacturer's API
   * @param {string} serviceHost the remote manufacturer's full REST URL
   * @param {number} serviceTimeoutMs how long to wait for a response from the service, in milliseconds
   */
  constructor(port, service, serviceHost, serviceTimeoutMs) {
    this.port = port;
    this.service = service;
    this.serviceHost = serviceHost;
    this.serviceTimeoutMs = serviceTimeoutMs
  }
}

/**
 * Configure the application based on environment variables.  The following
 * environment variables are supported:
 *
 * * `PORT` - listen for client requests on this port
 * * `SERVICE` - the Smartcar service identifier, e.g. "madeup_motors"
 * * `SERVICE_HOST` - the remote service endpoint for the identified service
 * * `SERVICE_TIMEOUT_IN_MS` - how long to wait for the remote service to reply before giving up
 *
 * @module settings
 * @function configureServer
 *
 * @returns {Settings} the settings for this instance of the server
 */
export default function configureServer() {
  const port = process.env.PORT || defaultPort;
  const service = process.env.SERVICE || defaultService;
  const serviceHost = process.env.SERVICE_HOST || defaultServiceHost;
  const serviceTimeoutMs = process.env.SERVICE_TIMEOUT || defaultServiceTimeoutMs;

  return new Settings(port, service, serviceHost, serviceTimeoutMs);
}
