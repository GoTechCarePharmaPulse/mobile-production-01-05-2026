import { io } from "socket.io-client";
import { SOCKET_URL } from "./config/api";



let socket: any;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL); // 🔥 change this
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  return socket;
};