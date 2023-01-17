const logger = require("./utils/logger");

// const io = require("socket.io")(8900, {
//   cors: {
//     origin: "http://localhost:3001",
//   },
// });
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.id === userId) && users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.id === userId);
};

function socket(io) {
  logger.info(`Sockets enabled`);

  io.on("connection", (socket) => {
    logger.info(`User connected ${socket.id}`);
    //when ceonnect

    //take userId and socketId from user
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
    });

    //send and get message
    socket.on("sendMessage", ({ sender_id, receiver_id, text }) => {
      const user = getUser(receiver_id);
      io.to(user.socketId).emit("getMessage", {
        sender_id,
        text,
      });
    });

    //when disconnect
    socket.on("disconnect", () => {
      console.log("a user disconnected!");
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });
}

module.exports = socket;
