// loads gRPC and the proto loader (same setup as traffic-light client)
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
//defines the path to the proto file
const PROTO_PATH = __dirname + '/parking.proto';
//loads the proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
//loads the ParkingService from the 'parking' package
const parkingProto = grpc.loadPackageDefinition(packageDefinition).parking;
// creates a client to talk to the server on port 50052
const client = new parkingProto.ParkingService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);
// starts server
console.log('About to call GetAvailableSpots...');
//calls the GetAvailableSpots RPC method
client.GetAvailableSpots({ location: 'Lot A' }, (err, response) => {
    if (err) {
      console.error('Error calling GetAvailableSpots:', err.message);
      return;
    }
  
    console.log(`Available spots at Lot A: ${response.available_spots}`);
  });
  //calls the ReserveMultipleSpots RPC method (client streaming)
const stream = client.ReserveMultipleSpots((err, response) => {
    if (err) {
      console.error('Error during reservation stream:', err.message);
      return;
    }
  
    console.log('Reservation Summary:');
    console.log('Total requested:', response.total_requested);
    console.log('Total successful:', response.total_successful);
  });
  
  // send multiple reservations
  stream.write({ user_id: 'u1', vehicle_reg: '12-D-34567', location: 'Lot A' });
  stream.write({ user_id: 'u2', vehicle_reg: '15-G-67890', location: 'Lot A' });
  stream.write({ user_id: 'u3', vehicle_reg: '21-C-99999', location: 'Lot A' });
  
  //closes stream
  stream.end();
  
  
