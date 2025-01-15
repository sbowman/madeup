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
will be deployed in a container of some sort. The following settings are
available:

* `PORT` - listen for client requests on this port; defaults to 3000
* `SERVICE` - the Smartcar service identifier, e.g. `madeup_motors`
* `SERVICE_HOST` - the remote service endpoint for the identified service

Currently the only service supported is Madeup Motors, identified by
`madeup_motors`, which defaults to host https://platform-challenge.smartcar.com.

## Metrics

The server uses Prometheus for generating metrics. These metrics are available
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

Note: _the service URL is not included in the metric labels. It should be easy
enough to reference by the service identifier and instance._

## Madeup Motors API Endpoint

The Madeup Motors API endpoint is:

https://platform-challenge.smartcar.com

This service is identified as "madeup_motors" in the Smartcar deployment:

    $ export SERVICE=madeup_motors
    $ export SERVICE_HOST='https://platform-challenge.smartcar.com'
    $ npm run dev
    ...snip...
    Connecting to Madeup Motors @ https://platform-challenge.smartcar.com...                                                                       │http_request_duration_seconds_count{status_code="200",method="GET",path="/vehicles/#val",instance="localhost",service="madeup_motors"} 1
    Server is online and listening to port 3000

This is the default `SERVICE` and `SERVICE_HOST`, so at least for now there is
no requirement to provide these environment variables.

### Sample API calls

If you don't have `jq` installed, simply drop the pipe. It prettifies the
output but isn't required.

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

## Future Considerations and Features

### Caching

Certain endpoint could be cached to reduce overhead on the remote service and
improve performance.  The results of the [Vehicle Info](API.md#Vehicle-Info) 
endpoint do not change, and could be cached by a proxy service such as 
[Varnish](https://varnish-cache.org/) or 
[Squid Cache](https://www.squid-cache.org/).

The [Start/Stop Engine](API.md#Start-Stop-Engine) endpoint should not be behind
a caching layer, as it modifies the state of the vehicle.  The range and 
security endpoints could be behind a short cache, perhaps 30 to 60 seconds.

### Door location

Currently door location comes from the remote service.  We should implement a
standard on how to identify the location of a door, so that we can properly 
translate the response from newer services into a common location identifier
such as "frontLeft."

### Drivetrain

Right now the drivetrain interface is fairly simple. It assumes the service
returns a value of either "electric" or a type of gas-powered engine. This may
not be the case for all manufacturers, so be sure to either update the
documentation or force the term "electric" if a future service endpoint uses a
different indicator.

### New service API call: current engine status

It would be nice if we could query a service like Madeup Motors for the current
state of the vehicle's engine.  We could then reduce the uncertainty and risk
to repetive and unnecessary start or stop engine requests.

### Support for multiple remote APIs

While the Smartcar service currently defaults to the Madeup Motors API, it is
designed to support multiple remote service. However, because the `SERVICE` is
configured on startup, only one remote API service is supported per deployed
instance.

This could be changed to support multiple remote services. The client could
include the service identifier in a header or as a query parameter, and the
server could keep a cached set of available services and call the correct one
based on the supplied service identifier.

For example:

    $ curl -H 'X-Smartcar-Service: madeup_motors' http://localhost:3000/vehicles/1234
    $ curl -H 'X-Smartcar-Service: another_service' http://localhost:3000/vehicles/1234

### Add OpenAPI or Swagger support

I don't know if this is common at Smartcar, but I sometimes find it nice to have
the Swagger-generated docs and web pages to play around with the API.  Also 
tends to be easier to maintain than the manually-generated [API.md](API.md) 
document I created.
