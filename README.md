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
