/** @module remote **/

import * as client from 'prom-client';

/**
 * Measure the latency of remote services.  Be sure to include the service name
 * in the `service` label.
 *
 * @type {Histogram<string>}
 */
export const latency = new client.Histogram({
  name: 'remote_latency_seconds',
  help: 'measures the latency of requests to Madeup Motors API in seconds',
  buckets: [0.1, 5, 15, 50, 100, 500],
  labelNames: ['instance', 'service', 'endpoint'],
});

