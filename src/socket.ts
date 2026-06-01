import { io } from "socket.io-client";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { SOCKET_URL } from "./config/api";

let socket: any;

/* =========================
   INIT SOCKET
========================= */

export const initSocket =
  async () => {

    if (socket?.connected) {
      return socket;
    }

    const token =
      await AsyncStorage.getItem(
        "accessToken"
      );

    const storedUser =
      await AsyncStorage.getItem(
        "user"
      );

    let parsedUser = null;

    try {

      if (storedUser) {
        parsedUser =
          JSON.parse(
            storedUser
          );
      }

    } catch {}

    socket = io(
      SOCKET_URL,
      {
        transports: [
          "websocket",
        ],

        auth: {
          token,
        },
      }
    );

    socket.on(
      "connect",
      () => {

        console.log(
          "🟢 SOCKET CONNECTED"
        );

        if (parsedUser) {

          socket.emit(
            "join",
            {
              userId:
                parsedUser._id ||
                parsedUser.id,

              tenantId:
                parsedUser.tenantId,

              role:
                parsedUser.role,
            }
          );
        }
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

    socket.on(
      "connect_error",
      (err: any) => {

        console.log(
          "❌ SOCKET ERROR:",
          err?.message
        );
      }
    );

    return socket;
  };

/* =========================
   GET SOCKET
========================= */

export const getSocket = () => {

  if (!socket) {
    throw new Error(
      "Socket not initialized"
    );
  }

  return socket;
};

/* =========================
   DISCONNECT SOCKET
========================= */

export const disconnectSocket =
  () => {

    if (socket) {

      socket.removeAllListeners();

      socket.disconnect();

      socket = null;
    }
  };