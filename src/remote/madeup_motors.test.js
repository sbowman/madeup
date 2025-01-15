import {describe, afterEach, test, expect, jest} from '@jest/globals';

import {MadeupMotorsService} from './madeup_motors.js';
import {Door} from './remote.js';

const mockResponse = (data, options = {}) => ({
  ok: true,
  status: 200,
  json: () => Promise.resolve(data),
  ...options,
});

const service = new MadeupMotorsService('http://localhost');

describe('Madeup Motors Service API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should return vehicle info for a valid ID', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse({
      'service': 'getVehicleInfo',
      'status': '200',
      'data': {
        'vin': {
          'type': 'String',
          'value': 'ABC1234'
        },
        'color': {
          'type': 'String',
          'value': 'Tourmaline Blue'
        },
        'fourDoorSedan': {
          'type': 'Boolean',
          'value': 'False'
        },
        'twoDoorCoupe': {
          'type': 'Boolean',
          'value': 'True'
        },
        'driveTrain': {
          'type': 'String',
          'value': 'v8'
        }
      }
    }));

    const info = await service.getVehicleInfo('55555');

    expect(info.vin).toBe('ABC1234');
    expect(info.color).toBe('Tourmaline Blue');
    expect(info.doorCount).toBe(2);
    expect(info.driveTrain).toBe('v8');
  });

  test('Should return details about all the doors for a valid ID', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse({
      'service': 'getSecurityStatus',
      'status': '200',
      'data': {
        'doors': {
          'type': 'Array',
          'values': [
            {
              'location': {
                'type': 'String',
                'value': 'frontLeft'
              },
              'locked': {
                'type': 'Boolean',
                'value': 'False'
              }
            },
            {
              'location': {
                'type': 'String',
                'value': 'frontRight'
              },
              'locked': {
                'type': 'Boolean',
                'value': 'True'
              }
            },
          ]
        }
      }
    }));

    const info = await service.getSecurity('2222');

    expect(info).toHaveProperty('doors');
    expect(info.doors).toHaveLength(2);
    expect(info.doors).toEqual(expect.arrayContaining([new Door('frontLeft', false)]));
    expect(info.doors).toEqual(expect.arrayContaining([new Door('frontRight', true)]));
  });

  test('Should return the fuel range of a gas-powered vehicle for a valid ID', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse({
      'service': 'getEnergy',
      'status': '200',
      'data': {
        'tankLevel': {
          'type': 'Number',
          'value': '30.2'
        },
        'batteryLevel': {
          'type': 'Null',
          'value': 'null'
        }
      }
    }));

    const info = await service.getFuelRange('81');

    expect(info.percent).toBe(30.2);
  });

  test('Should return the battery range of an electric vehicle for a valid ID', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse({
      'service': 'getEnergy',
      'status': '200',
      'data': {
        'tankLevel': {
          'type': 'Null',
          'value': 'null'
        },
        'batteryLevel': {
          'type': 'Number',
          'value': '83.01'
        }
      }
    }));

    const info = await service.getBatteryRange('97');

    expect(info.percent).toBe(83.01);
  });

  test('Should start the engine with a valid vehicle ID', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse({
      'service': 'actionEngine',
      'status': '200',
      'actionResult': {
        'status': 'EXECUTED'
      }
    }));

    const info = await service.startEngine('11');

    expect(info.status).toBe('success');
  });

  test('Should stop the engine with a valid vehicle ID', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse({
      'service': 'actionEngine',
      'status': '200',
      'actionResult': {
        'status': 'EXECUTED'
      }
    }));

    const info = await service.stopEngine('12');

    expect(info.status).toBe('success');
  });

  test('Should handle a Madeup Motors error for a bad vehicle ID', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse({
      'status': '404',
      'reason': 'Vehicle id: blah not found.'
    }));

    const methods = [
      service.getVehicleInfo,
      service.getSecurity,
      service.getFuelRange,
      service.getBatteryRange,
      service.startEngine,
      service.stopEngine,
    ];
    for (const method of methods) {
      const info = await method.call(service, '1234');
      expect(info.code).toBe(404);
      expect(info.reason).toContain('not found');
    }
  });

  test('An unexpected reply from the Madeup Motors API', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse({
      'service': 'getEnergy',
      'status': '200',
      'data': {
        'range': {
          'type': 'Number',
          'value': '85.33'
        },
        'power': {
          'type': 'String',
          'value': 'electric'
        }
      }
    }));

    const info = await service.getVehicleInfo('97');
    expect(info.code).toBe(503);
    expect(info.reason).toContain('did the API change');

    const doors = await service.getSecurity('97');
    expect(doors.code).toBe(503);
    expect(doors.reason).toContain('did the API change');

    const fuel = await service.getFuelRange('97');
    expect(fuel.code).toBe(503);
    expect(fuel.reason).toContain('did the API change');

    const battery = await service.getBatteryRange('97');
    expect(battery.code).toBe(503);
    expect(battery.reason).toContain('did the API change');

    const start = await service.startEngine('97');
    expect(start.code).toBe(503);
    expect(start.reason).toContain('did the API change');

    const stop = await service.stopEngine('97');
    expect(stop.code).toBe(503);
    expect(stop.reason).toContain('did the API change');

  });
});