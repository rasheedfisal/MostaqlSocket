require("dotenv").config();
var express = require("express");
var { createServer } = require("http");
var { Server } = require("socket.io");
var config = require("config");
const logger = require("./utils/logger");
const { version } = require("../package.json");

const socket = require("./socket");

const port = config.get("port");
const host = config.get("host");
const corsOrigin = config.get("corsOrigin");

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

app.get("/", (_, res) =>
  res.send(`Server is up and running version ${version}`)
);

httpServer.listen(port, host, () => {
  logger.info(`🚀 Server version ${version} is listening 🚀`);
  logger.info(`http://${host}:${port}`);

  socket(io);
});
