import Foundation
import NitroModules

class HybridPreference: HybridPreferenceSpec {
    // storage key to track user set preferences only
    private let trackedKeysStorageKey = "__nitro_preferences_tracked_keys__"

    
    //utility fns to help track and untrack keys
    private func getTrackedKeys() -> Set<String> {
        let keys = UserDefaults.standard.stringArray(forKey: trackedKeysStorageKey) ?? []
        return Set(keys)
    }

    private func setTrackedKeys(_ keys: Set<String>) {
        UserDefaults.standard.set(Array(keys).sorted(), forKey: trackedKeysStorageKey)
    }

    private func trackKey(_ key: String) {
        var keys = getTrackedKeys()
        keys.insert(key)
        setTrackedKeys(keys)
    }

    private func untrackKey(_ key: String) {
        var keys = getTrackedKeys()
        keys.remove(key)
        setTrackedKeys(keys)
    }

    //core impl 
    func getString(key: String) throws -> NitroModules.Promise<StringOutput> {
        return Promise.async {
            if let value = UserDefaults.standard.string(forKey: key) {
                return .second(value)
            } else {
                return .first(NullType.null)
            }
        }
    }

    func setString(key: String, value: String) throws
        -> NitroModules.Promise<Void>
    {
        return Promise.async {
            UserDefaults.standard.set(value, forKey: key)
            self.trackKey(key)
        }
    }

    func getNumber(key: String) throws -> NitroModules.Promise<NumberOutput> {
        return Promise.async {
            if UserDefaults.standard.object(forKey: key) != nil {
                return .second(UserDefaults.standard.double(forKey: key))
            } else {
                return .first(NullType.null)
            }
        }
    }

    func setNumber(key: String, value: Double) throws
        -> NitroModules.Promise<Void>
    {
        return Promise.async {
            UserDefaults.standard.set(value, forKey: key)
            self.trackKey(key)
        }
    }

    func getBool(key: String) throws -> NitroModules.Promise<BoolOutput> {
        return Promise.async {
            if UserDefaults.standard.object(forKey: key) != nil {
                return .second(UserDefaults.standard.bool(forKey: key))
            } else {
                return .first(NullType.null)
            }
        }
    }

    func setBool(key: String, value: Bool) throws -> NitroModules.Promise<Void>
    {
        return Promise.async {
            UserDefaults.standard.set(value, forKey: key)
            self.trackKey(key)
        }
    }

    func remove(key: String) throws -> NitroModules.Promise<Void> {
        return Promise.async {
            UserDefaults.standard.removeObject(forKey: key)
            self.untrackKey(key)
        }
    }

    func clear() throws -> NitroModules.Promise<Void> {
        return Promise.async {
            let trackedKeys = self.getTrackedKeys()
            for key in trackedKeys {
                UserDefaults.standard.removeObject(forKey: key)
            }
            self.setTrackedKeys([])
        }
    }

    func getAll() throws -> NitroModules.Promise<[PreferenceEntry]> {
        return Promise.async {
            let trackedKeys = self.getTrackedKeys()

            return trackedKeys.compactMap { key -> PreferenceEntry? in
                guard let rawValue = UserDefaults.standard.object(forKey: key) else {
                    return nil
                }

                if let v = rawValue as? String {
                    return PreferenceEntry(
                        key: key,
                        stringValue: .second(v),
                        numberValue: .first(NullType.null),
                        boolValue: .first(NullType.null)
                    )
                }
                // Check CFBoolean before NSNumber — Bool bridges through NSNumber on ObjC
                if let v = rawValue as? Bool {
                    return PreferenceEntry(
                        key: key,
                        stringValue: .first(NullType.null),
                        numberValue: .first(NullType.null),
                        boolValue: .second(v)
                    )
                }
                if let v = rawValue as? NSNumber {
                    if CFGetTypeID(v) == CFBooleanGetTypeID() {
                        return PreferenceEntry(
                            key: key,
                            stringValue: .first(NullType.null),
                            numberValue: .first(NullType.null),
                            boolValue: .second(v.boolValue)
                        )
                    }
                    return PreferenceEntry(
                        key: key,
                        stringValue: .first(NullType.null),
                        numberValue: .second(v.doubleValue),
                        boolValue: .first(NullType.null)
                    )
                }
                return nil
            }.sorted { $0.key < $1.key }

        }
    }
}
