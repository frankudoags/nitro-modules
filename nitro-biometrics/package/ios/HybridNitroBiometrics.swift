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

/*
import ExpoModulesCore
import LocalAuthentication

public class LocalAuthenticationModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoLocalAuthentication")

    AsyncFunction("hasHardwareAsync") { () -> Bool in
      let context = LAContext()
      var error: NSError?
      let isSupported: Bool = context.canEvaluatePolicy(LAPolicy.deviceOwnerAuthenticationWithBiometrics, error: &error)
      let isAvailable: Bool = isSupported || error?.code != LAError.biometryNotAvailable.rawValue

      return isAvailable
    }

    AsyncFunction("isEnrolledAsync") { () -> Bool in
      let context = LAContext()
      var error: NSError?
      let isSupported: Bool = context.canEvaluatePolicy(LAPolicy.deviceOwnerAuthenticationWithBiometrics, error: &error)
      let isEnrolled: Bool = (isSupported && error == nil) || error?.code == LAError.biometryLockout.rawValue

      return isEnrolled
    }

    AsyncFunction("supportedAuthenticationTypesAsync") { () -> [Int] in
      var supportedAuthenticationTypes: [Int] = []

      if isTouchIdDevice() {
        supportedAuthenticationTypes.append(AuthenticationType.fingerprint.rawValue)
      }

      if isFaceIdDevice() {
        supportedAuthenticationTypes.append(AuthenticationType.facialRecognition.rawValue)
      }

      return supportedAuthenticationTypes
    }

    AsyncFunction("getEnrolledLevelAsync") { () -> Int in
      let context = LAContext()
      var error: NSError?

      var level: Int = SecurityLevel.none.rawValue

      let isAuthenticationSupported: Bool = context.canEvaluatePolicy(LAPolicy.deviceOwnerAuthentication, error: &error)
      if isAuthenticationSupported && error == nil {
        level = SecurityLevel.secret.rawValue
      }

      let isBiometricsSupported: Bool = context.canEvaluatePolicy(LAPolicy.deviceOwnerAuthenticationWithBiometrics, error: &error)

      if isBiometricsSupported && error == nil {
        level = SecurityLevel.biometric.rawValue
      }

      return level
    }

    AsyncFunction("authenticateAsync") { (options: LocalAuthenticationOptions, promise: Promise) -> Void in
      var warningMessage: String?
      let reason = options.promptMessage
      let cancelLabel = options.cancelLabel
      let fallbackLabel = options.fallbackLabel
      let disableDeviceFallback = options.disableDeviceFallback

      if isFaceIdDevice() {
        let usageDescription = Bundle.main.object(forInfoDictionaryKey: "NSFaceIDUsageDescription")

        if usageDescription == nil {
          warningMessage = "FaceID is available but has not been configured. To enable FaceID, provide `NSFaceIDUsageDescription`."
        }
      }

      let context = LAContext()

      if fallbackLabel != nil {
        context.localizedFallbackTitle = fallbackLabel
      }

      if cancelLabel != nil {
        context.localizedCancelTitle = cancelLabel
      }

      context.interactionNotAllowed = false

      let policyForAuth = disableDeviceFallback ? LAPolicy.deviceOwnerAuthenticationWithBiometrics : LAPolicy.deviceOwnerAuthentication

      if disableDeviceFallback {
        if warningMessage != nil {
          // If the warning message is set (NSFaceIDUsageDescription is not configured) then we can't use
          // authentication with biometrics — it would crash, so let's just resolve with no success.
          // We could reject, but we already resolve even if there are any errors, so sadly we would need to introduce a breaking change.
          return promise.resolve([
            "success": false,
            "error": "missing_usage_description",
            "warning": warningMessage as Any
          ])
        }
      }

      context.evaluatePolicy(policyForAuth, localizedReason: reason ?? "") { success, error in
        var err: String?

        if let error = error as? NSError {
          err = convertErrorCode(error: error)
        }

        return promise.resolve([
          "success": success,
          "error": err as Any,
          "warning": warningMessage as Any
        ])
      }
    }
  }
}

func isFaceIdDevice() -> Bool {
  let context = LAContext()
  context.canEvaluatePolicy(LAPolicy.deviceOwnerAuthenticationWithBiometrics, error: nil)

  return context.biometryType == LABiometryType.faceID
}

func isTouchIdDevice() -> Bool {
  let context = LAContext()
  context.canEvaluatePolicy(LAPolicy.deviceOwnerAuthenticationWithBiometrics, error: nil)

  return context.biometryType == LABiometryType.touchID
}

func convertErrorCode(error: NSError) -> String {
  switch error.code {
  case LAError.systemCancel.rawValue:
    return "system_cancel"
  case LAError.appCancel.rawValue:
    return "app_cancel"
  case LAError.biometryLockout.rawValue:
    return "lockout"
  case LAError.userFallback.rawValue:
    return "user_fallback"
  case LAError.userCancel.rawValue:
    return "user_cancel"
  case LAError.biometryNotAvailable.rawValue:
    return "not_available"
  case LAError.invalidContext.rawValue:
    return "invalid_context"
  case LAError.biometryNotEnrolled.rawValue:
    return "not_enrolled"
  case LAError.passcodeNotSet.rawValue:
    return "passcode_not_set"
  case LAError.authenticationFailed.rawValue:
    return "authentication_failed"
  default:
      return "unknown: \(error.code), \(error.localizedDescription)"
  }
}

enum AuthenticationType: Int {
  case fingerprint = 1
  case facialRecognition = 2
 }

enum SecurityLevel: Int {
  case none = 0
  case secret = 1
  // We return any biometric as strong biometric, because there are currently no iOS devices with weak biometric options.
  case biometric = 3
 }
*/

/*
import LocalAuthentication
import NitroModules

class HybridBiometrics: HybridBiometricsSpec {

  // MARK: - getAvailability

  func getAvailability() throws -> BiometricsAvailability {
    let context = LAContext()
    var error: NSError?

    let canEvaluate = context.canEvaluatePolicy(
      .deviceOwnerAuthenticationWithBiometrics,
      error: &error
    )

    if canEvaluate {
      return BiometricsAvailability(
        available: true,
        biometryType: mapBiometryType(context.biometryType),
        unavailableReason: nil
      )
    }

    guard let laError = error as? LAError else {
      return BiometricsAvailability(
        available: false,
        biometryType: nil,
        unavailableReason: .notSupported
      )
    }

    let reason = mapUnavailableReason(laError)
    return BiometricsAvailability(
      available: false,
      biometryType: nil,
      unavailableReason: reason
    )
  }

  // MARK: - authenticate

  func authenticate(reason: String, options: AuthenticateOptions?) throws -> Promise<BiometricsAuthResult> {
    return Promise.async {
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

  // MARK: - Private helpers

  private func mapBiometryType(_ type: LABiometryType) -> BiometryType {
    switch type {
    case .faceID:   return .faceID
    case .touchID:  return .touchID
    default:        return .touchID // opticID etc., fallback gracefully
    }
  }

  private func mapUnavailableReason(_ error: LAError) -> BiometricsUnavailableReason {
    switch error.code {
    case .biometryNotAvailable:   return .notSupported
    case .biometryNotEnrolled:    return .notEnrolled
    case .biometryLockout:        return .lockedOut
    case .passcodeNotSet:         return .passcodeNotSet
    // notDetermined / denied surface as biometryNotAvailable before first auth attempt
    // We can detect denied by checking authorizationStatus if needed,
    // but LAContext doesn't expose it directly before evaluation.
    // The first authenticate() call will trigger the system prompt.
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
*/
