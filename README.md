# Madeup Motors Smartcar Challenge

This is my implementation of the _Madeup Motors Smartcar Challenge_.  My 
implementation is a bit more modular that it perhaps needed to be given the 
outline.  I tried to think ahead a bit.  In thinking about this with a 
"production" mindset, I architected the application so it would be easy to 
implement additional manufacturer's APIs and configure them at startup--with the 
intention that the application be expanded at some point to support multiple 
simultaneous backend REST services, i.e. multiple manufacturers.

I also tried to make sure all error handling was accounted for, and always 
returned both an appropriate HTTP error response code as well as a JSON object
outlining the reason for the error.  The JSON object also contains the error
response code, so clients may choose to parse the header or parse the JSON and
get the code in either place.  See [Error Handling](API.md#Error-Handling) for
details.

To run the server itself or test cases, see [Development](#Development) below.

For additional thoughts and features I might explore if I were to continue
development on this server, [see below](#Future-Considerations-and-Features).

[The Smartcar API](API.md) page contains details about the API, including 
sample request/response inputs and outputs.

## Third-party Node Modules

The following third-party libraries (and there dependencies) are used by this
application:

* [Express](https://expressjs.com/)
* [Prometheus](https://github.com/siimon/prom-client)
* [Express Prometheus Bundle](https://github.com/jochen-schweizer/express-prom-bundle)
* [Winston](https://github.com/winstonjs/winston), for logging

In development, the following packages are used:

* [Jest](https://jestjs.io/), for testing
* [JSDoc](https://jsdoc.app/), for generating source code API docs 

## Timeouts

The Madeup Motors client module in `remote/madeup_motors.js` is configured to
timeout if the service hangs or is otherwise unavailable.  When this happens,
it returns a `503 Gateway Error` to the client, with an explanation that
Madeup Motors service has timed out.  

The application intentionally does **not** retry requests.  I know some 
applications may take that approach, but I feel that if a service is struggling 
to fulfill requests, the last thing I as a client should do is double or triple 
the load (or worse) by adding more and more requests.

Instead, the downstream service using this application should either ask the 
user if they want to try again, thereby buying the Madeup Motors service some
time to recover.  

Or, if this API is being used by an automated service, perhaps grabbing vehicle 
data nightly, have the service try once.  If that request times out, try again 
15 minutes or an hour later.  Or even better, skip that day and try again the 
next, if that's an option, and log an error message for an adminstrator to check 
if it continues to happen multiple days. 

## Development

To run the server in development mode, use the scripts defined in `package.json`:

    $ npm run dev

To run test cases:

    $ npm run test

## Documentation

To generate the source code documentation, you can us [JSDoc](https://jsdoc.app/):

    $ npm run docs
    $ cd docs && open index.html            # Mac
    $ cd docs && xdg-open index.html        # Linux

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

### Limited service API: sedan and coupe

From the Madeup Motors API documentation, it looks like they only support two
kinds of vehicles:  "fourDoorSedan" and "twoDoorCoupe."  When determining the 
number of doors, these are the only options the Smartcar API currently parses
for.

Because of the way Madeup Motors includes both vehicle types in any vehicle 
info response, I don't try to support other types of vehicles.  If they add new
types of vehicles to their data model, this app would need an update to support.
 
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
