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
