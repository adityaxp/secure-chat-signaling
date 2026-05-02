import WebSocket, { WebSocketServer } from "ws";
import { getLocalIP } from "../utils";

type RegisterProfile = {
  userHash?: string;
  userType?: string;
  uplinkType?: string;
};

type SignalMessage = {
  type: string;
  from: string;
  to?: string;
  payload?: unknown;
  profile?: RegisterProfile;
  targetHash?: string;
};

const PORT = process.env.PORT || 4000;

const wss = new WebSocketServer({ port: Number(PORT) });
const clients = new Map<string, WebSocket>();
const hashToUserId = new Map<string, string>();
const userIdToHash = new Map<string, string>();

function normalizeHash(h: unknown): string {
  let s = String(h ?? "")
    .replace(/^0x/i, "")
    .replace(/\s/g, "")
    .toLowerCase();
  if (/^\d+$/.test(s) && s.length >= 1 && s.length <= 3) {
    s = s.padStart(3, "0");
  }
  return s;
}

function sendJson(ws: WebSocket, obj: object) {
  if (ws.readyState === 1) ws.send(JSON.stringify(obj));
}

wss.on("connection", (ws) => {
  console.log("Node P2P Client connected");

  ws.on("message", (message: WebSocket.RawData) => {
    try {
      const data = JSON.parse(message.toString()) as SignalMessage;
      const { type, from, to, payload } = data;

      if (type === "register") {
        const prevHash = userIdToHash.get(from);
        if (prevHash) {
          hashToUserId.delete(prevHash);
          userIdToHash.delete(from);
        }

        clients.set(from, ws);

        const nh = normalizeHash(data.profile?.userHash);
        if (nh) {
          hashToUserId.set(nh, from);
          userIdToHash.set(from, nh);
        }

        console.log(`✅ Registered: ${from}${nh ? ` (hash ${nh})` : ""}`);
        return;
      }

      if (type === "lookup-peer") {
        const nh = normalizeHash(data.targetHash);
        const requester = clients.get(from);
        if (!requester) return;

        const peerId = hashToUserId.get(nh);
        if (peerId && clients.has(peerId) && peerId !== from) {
          sendJson(requester, {
            type: "peer-found",
            peerId,
            targetHash: nh,
          });
        } else {
          sendJson(requester, { type: "peer-not-found", targetHash: nh });
        }
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
      } else if (to) {
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
        const nh = userIdToHash.get(sessionId);
        if (nh) {
          hashToUserId.delete(nh);
          userIdToHash.delete(sessionId);
        }
        console.log(`❌ Disconnected: ${sessionId}`);
      }
    }
  });
});

console.log(
  `🚀 Node P2P signaling server running on ws://${getLocalIP()}:${PORT}`,
);