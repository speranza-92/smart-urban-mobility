const fs = require('fs'); // used for writing to the log file

//loads gRPC and the proto loader. Same setup as traffic-light
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

//defines the path to the proto file
const PROTO_PATH = __dirname + '/parking.proto';

//loads the proto file and turns it into something that Node.js can work with
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

//loads the package named in the proto file "parking"
const parkingProto = grpc.loadPackageDefinition(packageDefinition).parking;

// defines the actual implementation of the ParkingService
const parkingService = {
  // handles the GetAvailableSpots RPC (unary)
  GetAvailableSpots: (call, callback) => {
    const location = call.request.location;
    const availableSpots = 44; // changeable if needed

    console.log(`Checking available spots at ${location}`);

    // log to file
    const logEntry = `${new Date().toISOString()} - Checked spots at ${location}, available: ${availableSpots}\n`;
    fs.appendFileSync('../logs/parking_log.txt', logEntry);

    // added log line for terminal/demo visibility
    console.log(`Responding to client with availability: ${availableSpots}`);

    callback(null, { available_spots: availableSpots });
  },

  // handles the ReserveMultipleSpots RPC (client streaming)
  ReserveMultipleSpots: (call, callback) => {
    let totalRequested = 0;
    let totalSuccessful = 0;

    call.on('data', (request) => {
      totalRequested++;
      console.log(`Reservation requested by ${request.user_id} for ${request.vehicle_reg} at ${request.location}`);

      // For simplicity, accept all requests
      totalSuccessful++;

      // log each reservation
      const logEntry = `${new Date().toISOString()} - Reserved for ${request.user_id} at ${request.location} (reg: ${request.vehicle_reg})\n`;
      fs.appendFileSync('../logs/parking_log.txt', logEntry);
    });

    call.on('end', () => {
      // send summary once stream ends
      callback(null, {
        total_requested: totalRequested,
        total_successful: totalSuccessful
      });
    });
  }
};

// creates and starts the gRPC server
const server = new grpc.Server();

server.addService(parkingProto.ParkingService.service, parkingService); // binds the service logic to proto

server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Server failed to start:', err);
    return;
  }

  console.log(`ParkingService gRPC server running on port ${port}`);
});
