# Madeup Motors Smartcar Challenge

## Challenge

The Madeup Motors (MM) car company has a terrible API. It returns badly 
structured JSON which isn't always consistent. Smartcar needs to adapt the API 
into a cleaner format. 

### Instructions

There are two API specifications provided below, the MM API and the Smartcar API Spec.
Your task is to implement the Smartcar spec by making HTTP requests to the MM API.

The flow looks like this:

    client --request--> Smartcar API --request--> MM API

Your tasks are as follows:

* Implement the Smartcar API specification using any frameworks or libraries as necessary
* Provide tests for your API implementation
* Write your code to be well structured and documented

### Assessment

1. Documentation
2. Modularization
3. Logging
4. Error Handling
5. Functionality
6. Testing
7. Code Style and Quality

## Launching the server

To run the server in development mode, use the scripts defined in `package.json`:

    $ npm run dev

To run test cases:

    $ npm run test

### Configuring the server

The server is managed through environment variables, with the anticipation it 
will be deployed in a container of some sort.  The following settings are
available:

* `PORT` - listen for client requests on this port
* `SERVICE` - the Smartcar service identifier, e.g. `madeup_motors`
* `SERVICE_HOST` - the remote service endpoint for the identified service

Currently the only service supported is Madeup Motors, identified by 
`madeup_motors`.

## Metrics

The server uses Prometheus for generating metrics.  These metrics are available
from the standard endpoint, `/metrics`.

The standard Prometheus default metrics are enabled, and can be found here:

https://prometheus.io/docs/instrumenting/writing_clientlibs/#standard-and-runtime-collectors

Additionally, HTTP metrics are enabled:

* `http_request_duration_seconds` (_Histogram_) - measures the total request/response time for each endpoint 
  (enabled by [`express-prom-bundle`](https://github.com/jochen-schweizer/express-prom-bundle))
* `remote_latency_seconds` (_Histogram_) - measure the time it takes to complete a request to a remote service like 
  Madeup Motors; includes a label, `endpoint` indicating the remote path requested 

Every metric includes the following labels:

* `instance` - the hostname of the server instance, configured from the `HOSTNAME` environment variable
* `service` - the service identifier for this instance, e.g. "madeup_motors," from the `SERVICE` environment variable

Note: _the service URL is not included in the metric labels.  It should be easy
enough to reference by the service identifier and instance._

## Madeup Motors API Endpoint

The Madeup Motors API endpoint is:

https://platform-challenge.smartcar.com

### Sample API calls

If you don't have `jq` installed, simply drop the pipe.  It prettifies the 
output but isn't required.

    $ curl http://localhost:3000/vehicles/1234 -s | jq
    {
        "vin": "123123412412",
        "color": "Metallic Silver",
        "doorCount": 4,
        "driveTrain": "v8"
    }

    $ curl https://platform-challenge.smartcar.com/v1/getVehicleInfoService \
       -X POST \
       -H 'Content-Type: application/json' \
       -d '{"id": "1234", "responseType": "JSON"}' -s | jq
    {
      "service": "getVehicleInfo",
      "status": "200",
      "data": {
        "vin": {
          "type": "String",
          "value": "123123412412"
        },
        "color": {
          "type": "String",
          "value": "Metallic Silver"
        },
        "fourDoorSedan": {
          "type": "Boolean",
          "value": "True"
        },
        "twoDoorCoupe": {
          "type": "Boolean",
          "value": "False"
        },
        "driveTrain": {
          "type": "String",
          "value": "v8"
        }
      }
    }
