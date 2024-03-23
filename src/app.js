require("dotenv").config();
var express = require("express");
const redis = require("redis");
const redisAdapter = require("@socket.io/redis-adapter");
var { createServer } = require("http");
var { Server } = require("socket.io");
var config = require("config");
const logger = require("./utils/logger");
const { version } = require("../package.json");

const socketHandler = require("./socket");

const port = config.get("port");
const host = config.get("host");

const corsOrigin = config.get("corsOrigin");

const redisPort = config.get("redis-port");
const redisHost = config.get("redis-host");

const app = express();

const pubClient = redis.createClient({
  socket: {
    host: redisHost,
    port: redisPort,
  },
});

pubClient.on("connect", () => {
  logger.info(
    `[Redis]: Connected to redis server at ${redisHost}:${redisPort}`
  );
});
const httpServer = createServer(app);
const subClient = pubClient.duplicate();

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  logger.info(`User connected ${socket.id}`);
  //when connect
  socketHandler(socket, io);
});

app.get("/", (_, res) =>
  res.send(`Server is up and running version ${version}`)
);

(async () => {
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(redisAdapter.createAdapter(pubClient, subClient));

  httpServer.listen(port, host, () => {
    logger.info(
      `🚀 Server version ${version} is listening on http://${host}:${port} 🚀`
    );
  });
})();
