import Foundation
import NitroModules

class HybridBattery: HybridBatterySpec {
    private var batteryInfoSubscribers: [Double: (BatteryInfo) -> Void] = [:]
    private var nextSubscriberId: Double = 0

    func getBatteryInfo() throws -> BatteryInfo {
        UIDevice.current.isBatteryMonitoringEnabled = true
        
        // UIDevice's batteryLevel is a float between 0.0 and 1.0, or -1.0 if the battery state is unknown.
        // We will treat -1.0 as nil, and any valid battery level as a double that we convert to a percentage (0.0 to 100.0).
        let level: BatteryLevelResult = UIDevice.current.batteryLevel >= 0
        ? .second(Double(UIDevice.current.batteryLevel) * 100)
        : .first(NullType.null)
        
        let state: BatteryStateResult
        switch UIDevice.current.batteryState {
        case .unknown:
            state = .unknown
        case .unplugged:
            state = .unplugged
        case .charging:
            state = .charging
        case .full:
            state = .full
        @unknown default:
            state = .unknown
        }
        
        return BatteryInfo(level: level, state: state)
    }
    
    func subscribe(callback: @escaping (BatteryInfo) -> Void) throws -> Double {
        let subscriberId = nextSubscriberId
        nextSubscriberId += 1
        batteryInfoSubscribers[subscriberId] = callback
        
        // Enable battery monitoring to receive updates
        UIDevice.current.isBatteryMonitoringEnabled = true
        
        // Post initial battery info to the new subscriber
        let initialInfo = try getBatteryInfo()
        callback(initialInfo)
        
        // Add observer for battery level changes if this is the first subscriber
        // no need to add multiple observers for multiple subscribers, we can just have one observer that notifies all subscribers
        if batteryInfoSubscribers.count == 1 {
            // Add observer for battery level changes
            NotificationCenter.default.addObserver(
                self,
                selector: #selector(batteryDidChange),
                name: UIDevice.batteryLevelDidChangeNotification,
                object: nil
            )
            // Add observer for battery state changes
            NotificationCenter.default.addObserver(
                self,
                selector: #selector(batteryDidChange),
                name: UIDevice.batteryStateDidChangeNotification,
                object: nil
            )
        }
        
        return subscriberId
    }
    
    func unsubscribe(id: Double) throws {
        batteryInfoSubscribers.removeValue(forKey: id)
        
        if batteryInfoSubscribers.isEmpty {
            // Disable battery monitoring if there are no subscribers
            UIDevice.current.isBatteryMonitoringEnabled = false
            // Remove observers
            NotificationCenter.default.removeObserver(
                self,
                name: UIDevice.batteryLevelDidChangeNotification,
                object: nil
            )
            NotificationCenter.default.removeObserver(
                self,
                name: UIDevice.batteryStateDidChangeNotification,
                object: nil
            )
        }
    }

    @objc private func batteryDidChange() {
    // get current info and fire all stored callbacks
        let currentInfo = try? getBatteryInfo()
        if let info = currentInfo {
            for callback in batteryInfoSubscribers.values {
                callback(info)
            }
        }
    }
}
