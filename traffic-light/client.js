// traffic-light/client.js updated so GUI runs

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/traffic.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const trafficProto = grpc.loadPackageDefinition(packageDefinition).traffic;

const client = new trafficProto.TrafficLight(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// get new_status from command line argument
const newStatus = process.argv[2] || 'GREEN'; // fallback to GREEN if not provided

client.ChangeLightStatus(
  {
    intersection_id: 'J5',
    new_status: newStatus
  },
  (err, response) => {
    if (err) {
      console.error('Error calling ChangeLightStatus:', err.message);
      return;
    }

    // only print the message for GUI consumption
    console.log(response.message);
  }
);
