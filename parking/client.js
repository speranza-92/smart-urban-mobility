// loads gRPC and the proto loader (same setup as traffic-light client)
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// defines the path to the proto file
const PROTO_PATH = __dirname + '/parking.proto';

// loads the proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

// loads the ParkingService from the 'parking' package
const parkingProto = grpc.loadPackageDefinition(packageDefinition).parking;

// creates a client to talk to the server on port 50052
const client = new parkingProto.ParkingService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

// gets location from command line args
const location = process.argv[2] || 'Lot A';

// calls the GetAvailableSpots RPC method
client.GetAvailableSpots({ location }, (err, response) => {
  if (err) {
    console.error('Error calling GetAvailableSpots:', err.message);
    return;
  }

  // ✨ Updated to ensure GUI regex finds the number correctly
  console.log(`Available spots at ${location}: ${response.available_spots}`);
});
