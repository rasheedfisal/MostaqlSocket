const logger = require("./utils/logger");

// const io = require("socket.io")(8900, {
//   cors: {
//     origin: "http://localhost:3001",
//   },
// });

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

function socketHandler(socket, io) {
  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });
  //send and get message
  socket.on(
    "sendMessage",
    ({ senderId, receiverId, text, fileUrl, message_type, time }) => {
      const user = getUser(receiverId);
      if (user?.socketId) {
        logger.info(`send User ${user.socketId}`);
        io.to(user.socketId).emit("getMessage", {
          senderId,
          receiverId,
          text,
          fileUrl,
          message_type,
          time,
        });
      }
    }
  );
  //send and get notifications
  socket.on("sendNotification", ({ receiverId, title, description }) => {
    const user = getUser(receiverId);
    if (user?.socketId) {
      logger.info(`send Notification ${user.socketId}`);
      io.to(user.socketId).emit("getNotification", {
        receiverId,
        title,
        description,
      });
    }
  });

  //'user is typing...'
  socket.on("typing", ({ receiverId }) => {
    const user = getUser(receiverId);
    if (user?.socketId) {
      io.to(user.socketId).emit("typing", { receiverId });
    }
  });

  //'broadcast active users'
  socket.on("active-users", () => {
    io.emit("getUsers", users);
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
}

module.exports = socketHandler;
