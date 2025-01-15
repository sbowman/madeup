#!/usr/bin/env sh

echo "Testing vehicle 1234..."

echo "\nAsking for vehicle info:" && curl http://localhost:3000/vehicles/1234 -s | jq
echo "\nAsking about the door locks:" && curl http://localhost:3000/vehicles/1234/doors -s | jq
echo "\nAsking for fuel range (value is random):" && curl http://localhost:3000/vehicles/1234/fuel -s | jq
echo "\nAsking for battery range (should be an error):" && curl http://localhost:3000/vehicles/1234/battery -s | jq

echo "\nStarting the engine (randomly fails and succeeds):" && curl http://localhost:3000/vehicles/1234/engine -H "Content-Type: application/json" -d '{"action": "START"}' -XPOST -s | jq
echo "\nStopping the engine (randomly fails and succeeds):" && curl http://localhost:3000/vehicles/1234/engine -H "Content-Type: application/json" -d '{"action": "STOP"}' -XPOST -s | jq

echo "\n\nTesting vehicle 1235..."

echo "\nAsking for vehicle info:" && curl http://localhost:3000/vehicles/1235 -s | jq
echo "\nAsking about the door locks:" && curl http://localhost:3000/vehicles/1235/doors -s | jq
echo "\nAsking for fuel range (should be an error):" && curl http://localhost:3000/vehicles/1235/fuel -s | jq
echo "\nAsking for battery range (value is random):" && curl http://localhost:3000/vehicles/1235/battery -s | jq

echo "\nStarting the engine (randomly fails and succeeds):" && curl http://localhost:3000/vehicles/1235/engine -H "Content-Type: application/json" -d '{"action": "START"}' -XPOST -s | jq
echo "\nStopping the engine (randomly fails and succeeds):" && curl http://localhost:3000/vehicles/1235/engine -H "Content-Type: application/json" -d '{"action": "STOP"}' -XPOST -s | jq

echo "\n\nTesting errors..."

echo "\nTesting a bad JSON body:" && curl http://localhost:3000/vehicles/1235/engine -H "Content-Type: application/json" -d "{'action': 'START'}" -XPOST -s | jq
echo "\nTesting a bad endpoint:" && curl http://localhost:3000/blahblah -s | jq
echo "\nTesting a missing vehicle ID:" && curl http://localhost:3000/vehicles -s | jq
echo "\nTesting a bad vehicle ID:" && curl http://localhost:3000/vehicles/abc -s | jq
