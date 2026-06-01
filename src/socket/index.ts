import { io } from "socket.io-client";

let socket: any = null;

/* =========================
   SOCKET URL
========================= */

/*
ANDROID EMULATOR:
http://172.20.10.6:4000

REAL DEVICE:
http://172.20.10.6:4000

PRODUCTION:
https://api.gotechcare.com
*/

const SOCKET_URL =
  "http://172.20.10.6:4000";

/* =========================
   INIT SOCKET
========================= */

export const initSocket = () => {
  if (!socket) {
    socket = io(
      SOCKET_URL,
      {
        transports: [
          "websocket",
        ],
        autoConnect: true,
      }
    );

    socket.on(
      "connect",
      () => {
        console.log(
          "🟢 SOCKET CONNECTED"
        );
      }
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          "🔴 SOCKET DISCONNECTED"
        );
      }
    );
  }

  return socket;
};

/* =========================
   GET SOCKET
========================= */

export const getSocket =
  () => socket;

export default socket;