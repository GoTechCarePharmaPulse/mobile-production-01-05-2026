import io from "socket.io-client";
import { socket } from "./socket";

import { SOCKET_URL } from "../config/api";

const socket = io(SOCKET_URL);

export const sendLocation = (userId, latitude, longitude) => {

  socket.emit("mr-location",{
    userId,
    latitude,
    longitude
  });

};