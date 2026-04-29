import WebSocket, { WebSocketServer } from "ws";
import { getLocalIP } from "../utils";

type SignalMessage = {
  type: "register" | "offer" | "answer" | "ice";
  from: string;
  to?: string;
  payload?: any;
};

const PORT = process.env.PORT || 4000;

const wss = new WebSocketServer({
  port: Number(PORT),
});
const clients = new Map<string, WebSocket>();

wss.on("connection", (ws) => {
  console.log("Node P2P Client connected");

  ws.on("message", (message: WebSocket.RawData) => {
    try {
      const data: SignalMessage = JSON.parse(message.toString());

      const { type, from, to, payload } = data;

      if (type === "register") {
        clients.set(from, ws);
        console.log(`✅ Registered: ${from}`);
        return;
      }

      if (to && clients.has(to)) {
        clients.get(to)?.send(
          JSON.stringify({
            type,
            from,
            payload,
          }),
        );
      } else {
        console.log(`⚠️ Peer not found: ${to}`);
      }
    } catch (err) {
      console.error("❌ Error parsing message:", err);
    }
  });

  ws.on("close", () => {
    for (const [sessionId, socket] of clients.entries()) {
      if (socket === ws) {
        clients.delete(sessionId);
        console.log(`❌ Disconnected: ${sessionId}`);
      }
    }
  });
});

console.log(
  `🚀 Node P2P signaling server running on ws://${getLocalIP()}:${PORT}`,
);
