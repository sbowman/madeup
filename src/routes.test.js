import {describe, afterAll, test, expect, jest} from '@jest/globals';
import createRoutes from './routes.js';

import {Door, DoorSecurity, RemoteVehicleService, VehicleInfo, Range, EngineStatus, Status} from './remote/remote.js';
import {ErrorResponse} from './errors.js';

// ...FIXTURES...

class MockService extends RemoteVehicleService {
  async getVehicleInfo(id) {
    switch (id) {
      case 'A':
        return new VehicleInfo('A123', 'Fire Engine Red', 3, 'v8');
      case 'B':
        return new VehicleInfo('B456', 'Miner 49 Gold', 3, 'electric');
      default:
        return new ErrorResponse('404', 'Vehicle not found.');
    }
  }

  async getSecurity(id) {
    switch (id) {
      case 'A':
        return new DoorSecurity([new Door('frontLeft', true), new Door('frontRight', true)]);
      case 'B':
        return new DoorSecurity([new Door('frontLeft', false), new Door('frontRight', true)]);
      default:
        return new ErrorResponse('404', 'Vehicle not found.');
    }
  }

  async getFuelRange(id) {
    switch (id) {
      case 'A':
        return new Range(23.7);
      case 'B':
        return new ErrorResponse('400', 'This vehicle is not gas-powered.');
      default:
        return new ErrorResponse('404', 'Vehicle not found.');
    }
  }

  async getBatteryRange(id) {
    switch (id) {
      case 'A':
        return new ErrorResponse('400', 'This vehicle is not electric.');
      case 'B':
        return new Range(46.33);
      default:
        return new ErrorResponse('404', 'Vehicle not found.');
    }
  }

  async startEngine(id) {
    switch (id) {
      case 'A':
        return new EngineStatus(Status.SUCCESS);
      case 'B':
        return new EngineStatus(Status.ERROR);
      default:
        return new ErrorResponse('404', 'Vehicle not found.');
    }
  }

  async stopEngine(id) {
    switch (id) {
      case 'A':
        return new EngineStatus(Status.ERROR);
      case 'B':
        return new EngineStatus(Status.SUCCESS);
      default:
        return new ErrorResponse('404', 'Vehicle not found.');
    }
  }
}

// ...TEST CASES...

const service = new MockService();
const server = createRoutes(service).listen(8888);

describe('Router endpoints', () => {
  afterAll(async () => {
    await server.close();
  });

  test('Endpoint /vehicles/:id should be valid', async () => {
    const resp = await fetch('http://localhost:8888/vehicles/A');
    expect(resp.status).toBe(200);
  });

  test('Endpoint /vehicles/:id/doors should be valid', async () => {
    const resp = await fetch('http://localhost:8888/vehicles/A/doors');
    expect(resp.status).toBe(200);
  });

  test('Endpoint /vehicles/:id/fuel should be valid', async () => {
    const resp = await fetch('http://localhost:8888/vehicles/A/fuel');
    expect(resp.status).toBe(200);
  });

  test('Endpoint /vehicles/:id/battery should be valid', async () => {
    const resp = await fetch('http://localhost:8888/vehicles/B/battery');
    expect(resp.status).toBe(200);
  });

  test('Endpoint /vehicles/:id/engine should be valid', async () => {
    const resp = await fetch('http://localhost:8888/vehicles/A/engine', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({"action": "START"})
    });
    expect(resp.status).toBe(200);
  });

  test('Endpoint /vehicles/:id should return 404 for an invalid vehicle ID', async () => {
    const resp = await fetch('http://localhost:8888/vehicles/7');
    expect(resp.status).toBe(404);
  });

  test('Endpoint /vehicles/:id/doors should return 404 for an invalid vehicle ID', async () => {
    const resp = await fetch('http://localhost:8888/vehicles/9/doors');
    expect(resp.status).toBe(404);
  });

  test('Endpoint /vehicles/:id/fuel should return 404 for an invalid vehicle ID', async () => {
    const resp = await fetch('http://localhost:8888/vehicles/88/fuel');
    expect(resp.status).toBe(404);
  });

  test('Endpoint /vehicles/:id/battery should return 404 for an invalid vehicle ID', async () => {
    const resp = await fetch('http://localhost:8888/vehicles/276/battery');
    expect(resp.status).toBe(404);
  });

  test('Endpoint /vehicles/:id/engine should return 404 for an invalid vehicle ID', async () => {
    const resp = await fetch('http://localhost:8888/vehicles/A/engine', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({"action": "START"})
    });
    expect(resp.status).toBe(404);
  });

  test('A bad endpoint should return a 404 JSON response', async () => {
    const resp = await fetch('http://localhost:8888/this/endpoint/does/not/exist');
    const body = await resp.json();

    expect(resp.status).toBe(404);
    expect(body.status).toBe('error');
    expect(body.reason).toBe('That endpoint does not exist.');
  });

  test('Bad POSTed JSON should return a 400 JSON response', async () => {
    const resp = await fetch('http://localhost:8888/vehicles/A', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: '"66{},this is not valid JSON'
    });
    const body = await resp.json();

    expect(resp.status).toBe(400);
    expect(body.status).toBe('error');
    expect(body.reason).toContain('Unable to parse the request\'s JSON body');
  });
});
