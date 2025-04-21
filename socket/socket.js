import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// connected users
let connected_users = {};

io.on("connection", (socket) => {
  // get staffId from socket
  const staffId = socket.handshake.query.staffId;

  // console.log("user connected", socket.id, staffId);

  // push new user with id to users
  if (!staffId) connected_users[staffId] = socket.id;

  socket.on("disconnect", () => {
    // console.log("user disconnected", socket.id, staffId);
    delete connected_users[staffId];
  });
});

// get connected users
export const get_connected_users = () => connected_users;

export { app, io, server };
