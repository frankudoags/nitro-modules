import Foundation
import LocalAuthentication
import NitroModules
import Security

class HybridNitroBiometrics: HybridNitroBiometricsSpec {
    func getAvailability() throws
        -> NitroModules.Promise<BiometricsAvailability>
    {
        //we need to check that:
        // 1. device supports biometrics
        // 2. if supported, which types are supported (faceID, touchID, etc.)
        // 3. if supported, are there any biometrics enrolled
        // 4. if not available, why not (not supported, not enrolled, locked out, etc.)

        Promise.async {
            let context = LAContext()
            var error: NSError?

            let canEvaluate = context.canEvaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                error: &error
            )
            let isAvailable = self.isAvailable(
                canEvaluate: canEvaluate,
                error: error
            )
            let isEnrolled = self.isEnrolled(
                canEvaluate: canEvaluate,
                error: error
            )
            let supportedBiometryTypes = self.supportedBiometryTypes(
                context: context
            )

            let unavailableReason: BiometricsUnavailableReason? = isAvailable
                ? nil
                : self.mapUnavailableReason(error as? LAError ?? LAError(.biometryNotAvailable))
            
            return BiometricsAvailability(
                available: isAvailable,
                isEnrolled: isEnrolled,
                supportedBiometryTypes: supportedBiometryTypes,
                unavailableReason: unavailableReason
            )
        }

    }

    func authenticate(reason: String, options: AuthenticateOptions?) throws
        -> NitroModules.Promise<BiometricsAuthResult>
    {
        Promise.async {
            let context = LAContext()

            // Apply options
            if let fallbackLabel = options?.fallbackLabel {
                context.localizedFallbackTitle = fallbackLabel
            }
            if options?.disableDeviceFallback == true {
                context.localizedFallbackTitle = "" // empty string hides the fallback button on iOS
            }
            if let cancelLabel = options?.cancelLabel {
                context.localizedCancelTitle = cancelLabel
            }

            let policy: LAPolicy = (options?.disableDeviceFallback == true)
                ? .deviceOwnerAuthenticationWithBiometrics
                : .deviceOwnerAuthentication

            do {
                let success = try await context.evaluatePolicy(policy, localizedReason: reason)
                if success {
                    return BiometricsAuthResult(success: true, error: nil)
                } else {
                    // evaluatePolicy returns false only in rare edge cases; errors are thrown
                    return BiometricsAuthResult(success: false, error: .unknown)
                }
            } catch let laError as LAError {
                return BiometricsAuthResult(success: false, error: self.mapAuthError(laError))
            } catch {
                return BiometricsAuthResult(success: false, error: .unknown)
            }
        }
    }

    // MARK: Helper functions
    private func isEnrolled(canEvaluate: Bool, error: NSError?) -> Bool {
        // If canEvaluate is true, biometrics are enrolled and available.
        // If canEvaluate is false and the error is biometryNotEnrolled, then biometrics are supported but not enrolled.
        return canEvaluate || (error as? LAError)?.code == .biometryNotEnrolled
    }

    private func isAvailable(canEvaluate: Bool, error: NSError?) -> Bool {
        return canEvaluate || (error as? LAError)?.code == .biometryNotAvailable
    }

    private func supportedBiometryTypes(context: LAContext)
        -> [SupportedBiometryType]
    {
        var types: [SupportedBiometryType] = []

        if isTouchIdDevice(context: context) {
            types.append(.second(.touchId))
        }

        if isFaceIdDevice(context: context) {
            types.append(.second(.faceId))
        }

        return types
    }

    private func isFaceIdDevice(context: LAContext) -> Bool {
        context.canEvaluatePolicy(
            LAPolicy.deviceOwnerAuthenticationWithBiometrics,
            error: nil
        )

        return context.biometryType == LABiometryType.faceID
    }

    private func isTouchIdDevice(context: LAContext) -> Bool {
        context.canEvaluatePolicy(
            LAPolicy.deviceOwnerAuthenticationWithBiometrics,
            error: nil
        )

        return context.biometryType == LABiometryType.touchID
    }

    private func mapUnavailableReason(_ error: LAError) -> BiometricsUnavailableReason {
        switch error.code {
        case .biometryNotAvailable:   return .notSupported
        case .biometryNotEnrolled:    return .notEnrolled
        case .biometryLockout:        return .lockedOut
        case .passcodeNotSet:         return .passcodeNotSet
        default:                      return .notSupported
        }
    }

    private func mapAuthError(_ error: LAError) -> BiometricsAuthError {
        switch error.code {
        case .userCancel:             return .userCancel
        case .userFallback:           return .userFallback
        case .systemCancel,
             .appCancel:              return .systemCancel
        case .biometryLockout:        return .lockedOut
        case .biometryNotAvailable:   return .notAvailable
        default:                      return .unknown
        }
    }

}
