import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { LogEntry } from "../types/logs";

interface UseWebSocketProps {
  onNewLog: (log: LogEntry) => void;
}

export const useWebSocket = ({ onNewLog }: UseWebSocketProps) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io("https://evallo-hab3.onrender.com", {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socketRef.current.on("newLog", (log: LogEntry) => {
      onNewLog(log);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [onNewLog]);

  return socketRef.current;
};
