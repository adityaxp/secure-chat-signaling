# secure-chat-signaling

A lightweight WebSocket signaling server for peer-to-peer chat connections.

This server keeps track of connected clients, supports user registration by `sessionId` and optional `userHash`, helps clients discover peers, and relays signaling payloads (for example, WebRTC offers/answers/ICE candidates) between clients.

- [Deploy on Render](https://render.com/deploy?repo=https://github.com/adityaxp/secure-chat-signaling)

## Signaling Flow

```bash
Peer A → Offer → Signaling Server → Peer B
Peer B → Answer → Signaling Server → Peer A
ICE Candidates exchanged between both peers
P2P Data Channel established
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

By default, the server starts on port `4000`.

To run on a custom port:

```bash
PORT=5000 npm run dev
```

## Build and Run

Build TypeScript output into `dist/`:

```bash
npm run build
```

Start compiled server:

```bash
npm start
```

## Signaling Protocol

All messages are JSON objects.

### 1) Register client

Client -> Server

```json
{
  "type": "register",
  "from": "session-123",
  "profile": {
    "userHash": "0x001",
    "userType": "user",
    "uplinkType": "wifi"
  }
}
```

### 2) Lookup peer by hash

Client -> Server

```json
{
  "type": "lookup-peer",
  "from": "session-123",
  "targetHash": "001"
}
```

Server -> Client (found)

```json
{
  "type": "peer-found",
  "peerId": "session-456",
  "targetHash": "001"
}
```

Server -> Client (not found)

```json
{
  "type": "peer-not-found",
  "targetHash": "001"
}
```

### 3) Relay signaling payload

Client -> Server

```json
{
  "type": "offer",
  "from": "session-123",
  "to": "session-456",
  "payload": {
    "sdp": "..."
  }
}
```

Server forwards to target client as:

```json
{
  "type": "offer",
  "from": "session-123",
  "payload": {
    "sdp": "..."
  }
}
```
