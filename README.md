# Madeup Motors Smartcar Challenge

First, thank you to everyone for taking the time to review my work and giving
me the opportunity to complete this challenge. I've enjoyed speaking with
everyone and appreciate all the support.

This is my implementation of the _Madeup Motors Smartcar Challenge_. My
implementation is a bit more modular that it perhaps needed to be, given the
requirements. In thinking about this with a "production" mindset, I architected
the application so it would be easy to implement additional manufacturer's APIs
and configure them at startup--with the intention that the application be
expanded at some point to support multiple simultaneous backend REST services,
i.e. multiple manufacturers. A side benefit to this approach is that it made
it easier to mock fixtures for test cases.

I also tried to make sure all error handling was accounted for, and always
return both an appropriate HTTP error response code as well as a JSON object
outlining the reason for the error. The JSON object also contains the error
response code, so clients may choose to parse the header or parse the JSON and
get the code in either place. See [Error Handling](API.md#Error-Handling) for
details.

I did not include any rate limiting or DDOS prevention support, beyond metrics,
working under the assumption there would be a proxy service such as Traefik or
Caddy in front of the deployed software that could manage that. For DDOS
prevention, I would likely start by putting Cloudflare in front of the service.
I also did not perform any load testing.

To run the server itself or test cases, see [Development](#Development) below.

For additional thoughts and features I might explore if I were to continue
development on this server, [see below](#Next-steps-and-out-of-scope).

[The Smartcar API](API.md) page contains details about the API, including
sample request/response inputs and outputs.

### Next steps and out of scope

The following are some of the things I didn't implement because they seemed to
be outside the scope of this challenge, but might be worth mentioning so you can
see how I think about these things:

* Create a `docker-compose.yml` to setup a Prometheus, Grafana, and potentially
  ELK stack (ElasticSearch, Logstash, Kibana) locally, so I could build out some
  monitoring dashboards and develop some Prometheus alerts. Also make sure my
  logs and metrics look good and are meaningful in general over time.
* Per the previous bullet, provide some Grafana baseline sample dashboards as
  JSON in the project. I could also include Prometheus Alertmanager YAML
  configurations to support alerting efforts. This would allow others to get
  a "leg up" if they're deploying this application without my input.
* Deploy [Charles Proxy](https://www.charlesproxy.com/) to improve dashboards
  and test various proxy solutions for caching and developing dashboards. I
  could use Charles to rate limit my API and the Madeup Motors API and better
  test for and uncover patterns related to network issues.
* Configure GitHub Actions to run CI/CD tests whenever a branch or PR was
  merged into the main branch.
* If this were to be deployed using containers, add a GitHub Action to publish
  a new (Docker) container image when the repository is tagged and potentially
  auto-deploy to a staging site.
* Use [Postman](https://www.postman.com/) or [Bruno](https://www.usebruno.com/)
  to create integration tests that can be run both locally and against deployed
  servers. I'd likely automate these test, so I'm checking nightly that the
  APIs are all responding and returning expected results.
* Configure load testing in a staging and potentially production environment. I
  tend to like [Vegeta](https://github.com/tsenart/vegeta), but
  [k6](https://github.com/grafana/k6) also works well. Use load testing to also
  wargame monitoring and alerting.

I find if you can find the time to implement a number of these ideas early in
the development process, in the long run you've got a really solid foundation to
build on without having to worry that the next new feature breaks older
features. And then you move much, much more quickly moving forward, focusing
more on feature development than on tech debt.

For feature-related ideas I'd look at implementing,
[see the end of this document](#Future-Considerations-and-Features).

## Third-party Node Modules

The following third-party libraries (and there dependencies) are used by this
application:

* [Express](https://expressjs.com/)
* [Prometheus](https://github.com/siimon/prom-client), for metrics
* [Express Prometheus Bundle](https://github.com/jochen-schweizer/express-prom-bundle)
* [Winston](https://github.com/winstonjs/winston), for logging

In development, the following packages are used:

* [Jest](https://jestjs.io/), for testing
* [JSDoc](https://jsdoc.app/), for generating source code API docs

## Timeouts

The Madeup Motors client module in `remote/madeup_motors.js` is configured to
timeout if the service hangs or is otherwise unavailable. When this happens,
it returns a `503 Gateway Error` to the client with an explanation that Madeup
Motors service has timed out.

The application intentionally does **not** retry requests. I know some
applications may take that approach, but I feel that if a service is struggling
to fulfill requests, the last thing I as a client should do is double or triple
the load (or worse) by adding more and more requests.

Instead, the downstream service using this application should either ask the
user if they want to try again, thereby buying the Madeup Motors service some
time to recover.

Or, if this API is being used by an automated service, perhaps grabbing vehicle
data nightly, have the service try once. If that request times out, try again
15 minutes or an hour later. Or even better, skip that day and try again the
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
* `SERVICE_TIMEOUT` - how long to wait for the service to respond, in ms; default to 5000ms
* `LOG_LEVEL` - level of logs to output; defaults to "info"
* `LOG_FILE` (_optional_) - a file to write the logs to; if not present, outputs logs to the console

Currently the only service supported is Madeup Motors, identified by
`madeup_motors`, which defaults to host https://platform-challenge.smartcar.com.

## Metrics

The server uses Prometheus for generating metrics. These metrics are available
from the standard endpoint, `/metrics`.

The standard Prometheus default metrics are enabled, and can be found here:

https://prometheus.io/docs/instrumenting/writing_clientlibs/#standard-and-runtime-collectors

Additionally, HTTP metrics are enabled (via
[express-prom-bundle](https://github.com/jochen-schweizer/express-prom-bundle)):

* `http_request_duration_seconds` (_Histogram_) - measures the total
  request/response time for each endpoint (enabled by
  [`express-prom-bundle`](https://github.com/jochen-schweizer/express-prom-bundle))

There is one custom metric available:

* `remote_latency_seconds` (_Histogram_) - measure the time it takes to complete
  a request to a remote service like Madeup Motors; includes a label, `endpoint`
  indicating the remote path requested

Every metric includes the following labels:

* `instance` - the hostname of the server instance, configured from the `HOSTNAME`
  environment variable
* `service` - the service identifier for this instance, e.g. "madeup_motors,"
  from the `SERVICE` environment variable

Note: _the service URL is not included in the metric labels. It should be easy
enough to reference by the service identifier and instance._

## Madeup Motors API Endpoint

The Madeup Motors API endpoint is:

https://platform-challenge.smartcar.com

This service is identified as "madeup_motors" in the Smartcar deployment:

    $ export SERVICE=madeup_motors
    $ export SERVICE_HOST='https://platform-challenge.smartcar.com'
    $ HOSTNAME=localhost npm run dev
    2025-01-15 12:32:05.854 AM [info] Connecting to Madeup Motors host=https://platform-challenge.smartcar.com
    2025-01-15 12:32:05.858 AM [info] The server is online and accepting requests port=3000

This is the default `SERVICE` and `SERVICE_HOST`, so at least for now there is
no requirement to provide these environment variables.

### Sample Madeup Motors API calls

(If you don't have `jq` installed, simply drop the pipe. It prettifies the
output but isn't required.)

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

If I were to continue working on this project, here's some features and
functionality I'd look at implementing in the future.

### User authentication

Before I put anything online, I like to at least make sure I have some basic
protections. Obviously without a published API document we have some "security
through obscurity," but that's little more than hiding the key under the door
mat.

I'd likely implement a username/password authentication framework based on JWTs
with regularly rotating, asychronous signing keys. Depending on servers and
load, I'd start with Argon2 and scale back to Bcrypt if Argon2 proved too
resource intensive. I like JWTs becuase it makes it easy to scale and doesn't
require extra database queries to manage requests. On the downside you have to
do a little more work and be extra diligent, as JWT has a few more attack
vectors open to it than a standard temporary user token.

### Caching

Certain endpoint could be cached to reduce overhead on the remote service and
improve performance. The results of the [Vehicle Info](API.md#Vehicle-Info)
endpoint do not change, and could be cached by a proxy service such as
[Varnish](https://varnish-cache.org/) or
[Squid Cache](https://www.squid-cache.org/).

The [Start/Stop Engine](API.md#Start-Stop-Engine) endpoint should not be behind
a caching layer, as it modifies the state of the vehicle. The range and
security endpoints could be behind a short cache, perhaps 30 to 60 seconds.

### Door location

Currently door location comes from the remote service. We should implement a
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
state of the vehicle's engine. We could then reduce the uncertainty and risk
to repetive and unnecessary start or stop engine requests.

### Limited service API: sedan and coupe

From the Madeup Motors API documentation, it looks like they only support two
kinds of vehicles:  "fourDoorSedan" and "twoDoorCoupe."  When determining the
number of doors, these are the only options the Smartcar API currently parses
for.

Because of the way Madeup Motors includes both vehicle types in any vehicle
info response, I don't try to support other types of vehicles. If they add new
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
the Swagger-generated docs and web pages to play around with the API. Also
tends to be easier to maintain than the manually-generated [API.md](API.md)
document I created.

## Apologies

Apologies for my JSDoc. I find it tricky to get source code-based APIs to
generate in JavaScript.  (I think I've been spoiled by Go and Elixir.) But it is
very helpful for linting my JavaScript when I'm not using TypeScript.
