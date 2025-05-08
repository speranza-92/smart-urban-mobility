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

// gets inputs from GUI (via process.argv)
const bus_id = process.argv[2] || 'E1';
const current_location = process.argv[3] || 'Stop A';
const status = process.argv[4] || 'On Time';

// starts the LiveBusStream bi-directional RPC
const stream = client.LiveBusStream();

// sends a single update from the GUI
stream.write({ bus_id, current_location, status });

// listens for a single server response
stream.on('data', (response) => {
  console.log(response.message); // GUI-safe response
});

// ends the stream
stream.end();
