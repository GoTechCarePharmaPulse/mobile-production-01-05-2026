import { useAuth } from "@/src/context/AuthContext";
import { useEffect, useState } from "react";

export default function useNotifications() {

  const { socket } = useAuth();
  const [notifications,setNotifications] = useState([]);

  useEffect(()=>{

    if(!socket) return;

    socket.on("notification",(data)=>{
      setNotifications(prev=>[data,...prev]);
    });

  },[socket]);

  return notifications;
}