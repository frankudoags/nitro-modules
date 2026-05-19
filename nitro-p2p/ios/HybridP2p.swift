import Foundation
import NitroModules


class HybridP2p: HybridP2PSpec {
    var onPeerDiscovered: Variant_NullType____peer__P2PPeer_____Void
    
    var onPeerLost: Variant_NullType____peerId__String_____Void
    
    var onPeerConnected: Variant_NullType____peer__P2PPeer_____Void
    
    var onPeerDisconnected: Variant_NullType____peerId__String_____Void
    
    var onMessage: Variant_NullType____message__P2PMessage_____Void
    
    var onError: Variant_NullType____code__String____message__String_____Void
    
    func setDeviceName(name: String) throws {
        <#code#>
    }
    
    func start(servicePort: Double?) throws {
        <#code#>
    }
    
    func stop() throws {
        <#code#>
    }
    
    func connect(peerId: String) throws {
        <#code#>
    }
    
    func disconnect(peerId: String) throws {
        <#code#>
    }
    
    func sendToPeer(peerId: String, data: String) throws {
        <#code#>
    }
    
    func broadcast(data: String) throws {
        <#code#>
    }
    
    func getDiscoveredPeers() throws -> [P2PPeer] {
        <#code#>
    }
    
    func getConnectedPeers() throws -> [P2PPeer] {
        <#code#>
    }
    
    
}
