import { type HybridObject } from 'react-native-nitro-modules'

// ─── Types ────────────────────────────────────────────────────────────────────

export type P2PPeer = {
  id: string // stable UUID generated once per app launch
  name: string // human-readable device name
  host: string // LAN IP address
  port: number // TCP port the peer's server is bound to
}

export type P2PMessage = {
  fromPeerId: string
  data: string // always JSON — callers serialise/deserialise
}

export enum P2PEventType {
  PeerDiscovered,
  PeerLost,
  PeerConnected,
  PeerDisconnected,
  MessageReceived,
  Error,
}

export type P2PPeerDiscovered = {
  type: P2PEventType.PeerDiscovered
  peer: P2PPeer
}

export type P2PPeerLost = {
  type: P2PEventType.PeerLost
  peerId: string
}

export type P2PPeerConnected = {
  type: P2PEventType.PeerConnected
  peer: P2PPeer
}

export type P2PPeerDisconnected = {
  type: P2PEventType.PeerDisconnected
  peerId: string
}

export type P2PMessageReceived = {
  type: P2PEventType.MessageReceived
  message: P2PMessage
}

export type P2PErrorEvent = {
  type: P2PEventType.Error
  code: string
  message: string
}

// A discriminated union — one callback type covers every event.
// The caller switches on `event.type` to handle each case.
export type P2PEvent =
  | P2PPeerDiscovered
  | P2PPeerLost
  | P2PPeerConnected
  | P2PPeerDisconnected
  | P2PMessageReceived
  | P2PErrorEvent

export type P2PEventCallback = (event: P2PEvent) => void

// ─── Spec ─────────────────────────────────────────────────────────────────────

export interface P2P extends HybridObject<{
  ios: 'swift'
  android: 'kotlin'
}> {
  // Identity — call before start()
  setDeviceName(name: string): void

  // Lifecycle
  start(servicePort?: number): void
  stop(): void

  // Connection
  connect(peerId: string): void
  disconnect(peerId: string): void

  // Messaging
  sendToPeer(peerId: string, data: string): void
  broadcast(data: string): void

  // State queries (synchronous snapshots)
  getDiscoveredPeers(): P2PPeer[]
  getConnectedPeers(): P2PPeer[]

  // ─── Event subscription ───────────────────────────────────────────────────
  // Returns a numeric subscription ID. Pass it to unsubscribe() to cancel.
  // Multiple callers can subscribe independently — each gets their own ID.
  subscribe(callback: P2PEventCallback): number
  unsubscribe(id: number): void
}
