const fs = require('fs'); // used for writing to the log file

// loads gRPC and the proto loader. Packages that were installed with npm
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// defines the path to the proto file
const PROTO_PATH = __dirname + '/traffic.proto';

// loads the proto file and turns it into something that Node.js can work with
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true, // keep field names as is
  longs: String, // handles long numbers as strings
  enums: String,
  defaults: true,
  oneofs: true
});

//loads the package named in the proto file "traffic"
const trafficProto = grpc.loadPackageDefinition(packageDefinition).traffic;

// defines the actual implementation of the TrafficLight service
const trafficService = {
  ChangeLightStatus: (call, callback) => {
    const { intersection_id, new_status } = call.request;
  
    console.log(`Changing light at ${intersection_id} to ${new_status}`); // console log for visibility
  
    // NEW:log to file
    const logEntry = `${new Date().toISOString()} - Changed light at ${intersection_id} to ${new_status}\n`;
    fs.appendFileSync('../logs/traffic_log.txt', logEntry); // write to logs folder (one level up)
  
    // Respond to the client
    callback(null, {
      message: `Light changed to ${new_status} at ${intersection_id}`,
      timestamp: new Date().toISOString()
    });
  },

  // This is the function for the StreamTrafficConditions RPC
  StreamTrafficConditions: (call) => {
    const area = call.request.area_code;
    console.log(`Streaming traffic updates for area: ${area}`);
  
    // dummy updates (*add to this if needed*)
    const updates = [
      'Heavy traffic at 9am',
      'Moderate traffic at 10am',
      'Clear roads at 11am'
    ];
  
    updates.forEach((status, index) => {
      setTimeout(() => {
        call.write({
          condition: status,
          update_time: new Date().toISOString()
        });
  
        // when last update sent: end the stream
        if (index === updates.length - 1) {
          call.end();
        }
      }, index * 1000); // sends 1 per second
    });
  }
};

// creates and starts the gRPC server
const server = new grpc.Server();

server.addService(trafficProto.TrafficLight.service, trafficService); // binds the service logic to the proto definition

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Server failed to start:', err);
    return;
  }

  console.log(`TrafficLight gRPC server running on port ${port}`);
});


  