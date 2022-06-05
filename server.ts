import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from './proto/random';
import { RandomHandlers } from './proto/randomPackage/Random';
import { TodoResponse } from './proto/randomPackage/TodoResponse';
import { TodoRequest } from './proto/randomPackage/TodoRequest';

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

const todoList: TodoResponse = {
  todos: []
}

function getServer() {
  const server = new grpc.Server();
  server.addService(randomPackage.Random.service, {
    PingPong: (req, res) => {
      console.log(req.request);
      res(null, { message: "Pong!"})
    },
    RandomNumbers: (call) => {
      const { maxVal = 10} = call.request;

      let runCount = 0;
      
      const id = setInterval(() => {
        runCount += 1;
        call.write({ number: Math.floor(Math.random() * maxVal )});

        if(runCount >= 10) {
          clearInterval(id);
          call.end();
        };
      }, 500);
    },
    TodoList: (call, callback) => {
      call.on("data", (chunk) => {
        todoList.todos?.push(chunk);
        console.log(todoList);
      });
      
      call.on("end", () => {
        callback(null, { todos: todoList.todos });
      });
    }
  } as RandomHandlers);

  return server;
};

main();
