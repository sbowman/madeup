# Smartcar Service API

The Smartcar service API simplifies the interactions when querying various 
automakers' APIs about their vehicles by implementing a universal API that 
can support any vehicle make or model.

This document describes the available Smartcar endpoints, with their required
inputs and samples of their outputs.

## Error Handling

Any endpoint may return an error.  I have tried to standardize on the format
of the error and make sure to catch any issues.  If you find an endpoint 
returning a response not in this format, please file a bug ticket.

An error response will have the HTTP response code set to a 400 or 500 error
code.  The response body will look like so:

    { 
        "status": "error",
        "code": 404,
        "reason": "Vehicle ID 123 not found."
    }

The code in the response should match the HTTP response code.

If the remote service times out, the Smartcar API service will return a `503
Gateway Timeout` error.  By default, the Smartcar API waits for three seconds
for a response from the remote service before giving up.

## Vehicle Info

### Request

    GET /vehicles/:id

The `:id` represents the remote automater's internal identifier for the vehicle
in question.  Note that `:id` does not necessarily correlate to the VIN number.
 
### Response 

The endpoint returns an object describing the vehicle with the following 
properties:

* `vin` (_string_) - the vehicle information number
* `color` (_string_) - the external paint color of the vehicle
* `doorCount` (_number_) - the number of doors on the vehicle
* `driveTrain` (_string_) - what type of engine or power plant is used by this 
  vehicle

The VIN number of a vehicle should be universally unique, even across 
manufacturers.  However, this API returns the VIN number returned by the remote
service, so depending on the service _we cannot guarantee uniqueness of this 
value_.

The `driveTrain` indicates how the vehicle is powered.  This may be an engine
type, such as "v8" or "v6."  In the case of an electric vehicle, is should be
"electric."

### Example

    $ curl http://<server:port>/vehicles/1234 -s | jq
    {
        "vin": "1213231",
        "color": "Metallic Silver",
        "doorCount": 4,
        "driveTrain": "v8"
    }

## Security

### Request

    GET /vehicles/:id/doors

The `:id` represents the remote automater's internal identifier for the vehicle
in question.  This is not necessarily the VIN number, and if the two are 
different, use the ID.

### Response

The endpoint responds with an array of doors on the vehicle, along with their
state, i.e. if they're locked or not.  Each door has two properties:

* `location` (_string_) - the location of the door, e.g. "frontLeft" or 
  "backRight"
* `locked` (_boolean_) - is the door locked?

### Example

    $ curl http://<server:port>/vehicles/1234/doors -s | jq
    [
        {
            "location": "frontLeft",
            "locked": true
        },
        {
            "location": "frontRight",
            "locked": true
        },
        {
            "location": "backLeft",
            "locked": true
        },
        {
            "location": "backRight",
            "locked": false
        }
    ]

## Fuel Range

Queries the vehicle for how much remaining fuel it has.  

Note this isn't really a "range," per se, but rather a measure of fuel remaining
in the tank.  From this, if you have the average MPG of the vehicle, you should 
be able to roughly calculate the range of the vehicle.

### Request

    GET /vehicles/:id/fuel

The `:id` represents the remote automater's internal identifier for the vehicle
in question.  This is not necessarily the VIN number, and if the two are
different, use the ID.

### Response

This endpoint responds with a simple object containing one property:

* `range` (_number_) - a percentage indicating percent of remaining gasoline

Note that if the vehicle is battery-powered, i.e. an electric vehicle, this
endpoint will return a `400 Bad Request` and recommend you call the `/battery`
endpoint.

### Example

    $ curl http://<server:port>/vehicles/1234/fuel -s | jq 
    {
        "percent": 30.2
    }

The above indicates the tank as 30.2% fuel remaining in it.

## Battery Range

Queries the vehicle for how much remaining battery power it has.

Note this isn't really a "range," per se, but rather a measure of charge 
remaining in the batteries.  From this, if you have the average range of a 
fully-charged vehicle, you should be able to roughly calculate the range of the 
vehicle.

### Request

    GET /vehicles/:id/battery

The `:id` represents the remote automater's internal identifier for the vehicle
in question.  This is not necessarily the VIN number, and if the two are
different, use the ID.

### Response

This endpoint responds with a simple object containing one property:

* `range` (_number_) - a percentage indicating percent of remaining battery 
  power

Note that if the vehicle is gas-powered, this endpoint will return a `400 Bad 
Request` and recommend you call the `/fuel` endpoint.

### Example

    $ curl http://<server:port>/vehicles/1234/battery -s | jq
    {
        "percent": 22.93
    }

The above indicates the batteries have 22.93% charge remaining.

## Start/Stop Engine

Remote start or stop the engine.

To start the engine, POST a request to the `vehicles/:id/engine` endpoint with
a JSON body containing an "action" property indicating either "START" or "STOP"
to the Smartcar API.  

### Request

    POST /vehicles/:id/engine
    Content-Type: application/json
    {
        "action": "START|STOP"
    }

The `:id` represents the remote automater's internal identifier for the vehicle
in question.  This is not necessarily the VIN number, and if the two are
different, use the ID.

The "action" may be either "START" or "STOP," but not both.  If any other value
is used for action, returns a `400 Bad Request`.

### Response

If the call is successful, the endpoint returns a simple object with a single
property:

* `status` (_string_) - either "success" if the service accepted the request or 
  "error" if it didn't

Note that even if calling this endpoint results in a successful response, that
doesn't mean the vehicle has been started.  It is up to the remote service to
properly start the vehicle; this call is only a recommendation to the service.

### Example

    $ curl -XPOST http://<server:port>/vehicles/1234/engine \
    -d '{"action": "START"}' -H "Content-Type: application/json" -s | jq
    {
        "status": "success"
    }


