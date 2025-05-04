// loads gRPC and the proto loader (same packages I used in server.js)
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// loads the proto file
const PROTO_PATH = __dirname + '/traffic.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

// loads the TrafficLight service from the proto package
const trafficProto = grpc.loadPackageDefinition(packageDefinition).traffic;

// creates a client to talk to the server at localhost 50051
const client = new trafficProto.TrafficLight(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// calls ChangeLightStatus RPC method
client.ChangeLightStatus(
    {
      intersection_id: 'J5',
      new_status: 'GREEN'
    },
    (err, response) => {
      if (err) {
        console.error('Error calling ChangeLightStatus:', err);
        return;
      }
  
      console.log('Server response:', response.message);
      console.log('Timestamp:', response.timestamp);
    }
  );

  // calls StreamTrafficConditions RPC method
client.StreamTrafficConditions({ area_code: 'D8' })
.on('data', (response) => {
  console.log('Traffic update:', response.condition);
  console.log('Update time:', response.update_time);
})
.on('end', () => {
  console.log('Streaming ended.');
})
.on('error', (err) => {
  console.error('Stream error:', err.message);
});

  