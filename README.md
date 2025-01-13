# Madeup Motors Smartcar Challenge

## Challenge

The Madeup Motors (MM) car company has a terrible API. It returns badly structured JSON
which isn't always consistent. Smartcar needs to adapt the API into a cleaner format.
Instructions

There are two API specifications provided below, the MM API and the Smartcar API Spec.
Your task is to implement the Smartcar spec by making HTTP requests to the MM API.

The flow looks like this:

    client --request--> Smartcar API --request--> MM API

Your tasks are as follows:

* Implement the Smartcar API specification using any frameworks or libraries as necessary
* Provide tests for your API implementation
* Write your code to be well structured and documented

## API Endpoint

The Madeup Motors API endpoint is:

https://platform-challenge.smartcar.com

### Sample API call

    curl https://platform-challenge.smartcar.com/v1/getVehicleInfoService \
       -X POST \
       -H 'Content-Type: application/json' \
       -d '{"id": "1234", "responseType": "JSON"}'

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
