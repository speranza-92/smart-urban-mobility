// loads gRPC and the proto loader (same setup as previous clients)
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// defines the path to the proto file
const PROTO_PATH = __dirname + '/transport.proto';

// loads the proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

// loads the TransportService from the 'transport' package
const transportProto = grpc.loadPackageDefinition(packageDefinition).transport;

// creates a client to talk to the server on port 50053
const client = new transportProto.TransportService(
  'localhost:50053',
  grpc.credentials.createInsecure()
);
// starts the LiveBusStream bi directional RPC
const stream = client.LiveBusStream();

console.log('Starting LiveBusStream...');

//sends multiple updates from the client
stream.write({ bus_id: 'E1', current_location: 'Stop 1', status: 'On Time' });
stream.write({ bus_id: 'E1', current_location: 'Stop 2', status: 'Delayed' });
stream.write({ bus_id: 'E1', current_location: 'Stop 3', status: 'Moving Again' });

// listens for responses from the server
stream.on('data', (response) => {
  console.log('Server response:', response.message);
  console.log('Timestamp:', response.timestamp);
});

// ends the stream once all updates are sent
stream.end();

