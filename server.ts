import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from './proto/random';
import { RandomHandlers } from './proto/randomPackage/Random';

const PORT = 8082;
const PROTO_FILE = "./proto/random.proto";

const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE));
const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType;
const randomPackage = grpcObj.randomPackage;

function main() {
  const server = getServer();

  server.bindAsync(`0.0.0.0:${PORT}`,grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) return console.log(err);
    console.log(`Your server as started on port ${port}`);
    server.start();
  })
};

function getServer() {
  const server = new grpc.Server();
  server.addService(randomPackage.Random.service, {
    "PingPong": (req, res) => {
      console.log(req, res);
    }
  } as RandomHandlers);

  return server;
};

main();
