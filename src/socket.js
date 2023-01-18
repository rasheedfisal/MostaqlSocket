const logger = require("./utils/logger");

// const io = require("socket.io")(8900, {
//   cors: {
//     origin: "http://localhost:3001",
//   },
// });

const addUser = (users, userId, socketId) => {
  !users.some((user) => user.id === userId) && users.push({ userId, socketId });
};

const removeUser = (users, socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (users, userId) => {
  return users.find((user) => user.id === userId);
};

function socket(io, users) {
  logger.info(`Sockets enabled`);

  io.on("connection", (socket) => {
    logger.info(`User connected ${socket.id}`);
    //when ceonnect

    //take userId and socketId from user
    socket.on("addUser", (userId) => {
      addUser(users, userId, socket.id);
      io.emit("getUsers", users);
    });

    //send and get message
    socket.on("sendMessage", ({ sender_id, receiver_id, text }) => {
      const user = getUser(users, receiver_id);
      logger.info(`send User ${user.socketId}`);
      if (user) {
        io.to(user.socketId).emit("getMessage", {
          sender_id,
          text,
        });
      }
    });

    //when disconnect
    socket.on("disconnect", () => {
      console.log("a user disconnected!");
      removeUser(users, socket.id);
      io.emit("getUsers", users);
    });
  });
}

module.exports = socket;
