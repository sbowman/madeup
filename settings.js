const defaultPort = 3000;
const defaultService = 'madeup_motors';
const defaultServiceHost = 'https://platform-challenge.smartcar.com';

/**
 * Settings defines the configurable properties of this REST server.
 */
export class Settings {
  /**
   * @constructor
   * @param {number} port the port to listen to for requests
   * @param {string} service the service identifier for the remote manufacturer's API
   * @param service_host the remote manufacturer's full REST URL
   */
  constructor(port, service, service_host) {
    this.port = port;
    this.service = service;
    this.service_host = service_host;
  }
}

/**
 * Configure the application based on environment variables.  The following
 * environment variables are supported:
 *
 * * `PORT` - listen for client requests on this port
 * * `SERVICE` - the Smartcar service identifier, e.g. "madeup_motors"
 * * `SERVICE_HOST` - the remote service endpoint for the identified service
 *
 * @returns {Settings} the settings for this instance of the server
 */
export default function configureServer() {
  const port = process.env.PORT || defaultPort;
  const service = process.env.SERVICE || defaultService;
  const serviceHost = process.env.SERVICE_HOST || defaultServiceHost;

  return new Settings(port, service, serviceHost);
}
