import {describe, afterAll, test, expect, jest, afterEach} from '@jest/globals';

import {MadeupMotorsService} from './madeup_motors.js';
import express from 'express';

describe('Router endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('A timeout response from the Madeup Motors service API', async () => {
    // Do this so fast Google doesn't have time to respond...couldn't get Jest
    // to mock this and timeout, so this is my alternative.
    const service = new MadeupMotorsService('https://www.google.com', 1);

    const info = await service.getBatteryRange('100');
    expect(info).not.toHaveProperty('percent');
    expect(info.code).toBe(503);
    expect(info.reason).toBe('The Madeup Motors service did not respond in the expected amount of time (1 ms).');
  });
});
