import configureServer from './settings.js';
import identifyService from './remote/identifier.js';
import createRoutes from './routes.js';

const settings = configureServer();
const service = identifyService(settings.service, settings.serviceHost, settings.serviceTimeoutMs);

const server = createRoutes(service);
server.listen(settings.port, () => {
  console.log('Server is online and listening to port 3000');
});


