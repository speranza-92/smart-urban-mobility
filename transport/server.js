const fs = require('fs'); //used for writing to the log file

// loads gRPC and the proto loader. Same as previous services
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
// defines the path to the proto file
const PROTO_PATH = __dirname + '/transport.proto';
// loads the proto file and turns it into something that Node.js can work with
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
// loads the package named in the proto file "transport"
const transportProto = grpc.loadPackageDefinition(packageDefinition).transport;
// handles the LiveBusStream RPC (bidirectional streaming)
const transportService = {
    LiveBusStream: (call) => {
      console.log('LiveBusStream started');
  
      call.on('data', (busUpdate) => {
        console.log(`Bus ${busUpdate.bus_id} at ${busUpdate.current_location} is ${busUpdate.status}`);
  
        // log to file
        const logEntry = `${new Date().toISOString()} - Bus ${busUpdate.bus_id} at ${busUpdate.current_location} is ${busUpdate.status}\n`;
        fs.appendFileSync('../logs/transport_log.txt', logEntry);
  
        // send a response for each message received
        call.write({
          message: `Update received for bus ${busUpdate.bus_id}`,
          timestamp: new Date().toISOString()
        });
      });
  
      call.on('end', () => {
        console.log('LiveBusStream ended');
        call.end();
      });
    }
  };
  // creates and starts the gRPC server
const server = new grpc.Server();

server.addService(transportProto.TransportService.service, transportService); // bind the service logic to proto

server.bindAsync('0.0.0.0:50053', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Server failed to start:', err);
    return;
  }

  console.log(`TransportService gRPC server running on port ${port}`);
});

  
