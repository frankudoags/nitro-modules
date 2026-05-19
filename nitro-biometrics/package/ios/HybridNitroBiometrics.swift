import Foundation
import LocalAuthentication
import NitroModules
import Security

class HybridNitroBiometrics: HybridNitroBiometricsSpec {
    func works() throws -> Bool {
        true
    }

    func isAvailable() throws -> BiometricsAvailability {
        let context = LAContext()
        var error: NSError?

        let available = context.canEvaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            error: &error
        )

        if !available {
            return BiometricsAvailability(
                isAvailable: false,
                biometryType: .first(.null),
                error: error?.localizedDescription
            )
        }

        let type: BiometryType?

        switch context.biometryType {
        case .faceID:
            type = .faceId
        case .touchID:
            type = .touchId
        case .opticID:
            type = .iris
        default:
            type = nil
        }

        if type == nil {
            return BiometricsAvailability(
                isAvailable: false,
                biometryType: .first(.null),
                error: "Device does not support biometrics"
            )
        }

        return BiometricsAvailability(
            isAvailable: true,
            biometryType: .second(type!),
            error: nil
        )

    }

    func authenticate(reason: String) throws
        -> NitroModules.Promise<BiometricsAuthResult>
    {
        Promise.async {
            let context = LAContext()
            var error: NSError?

            let available = context.canEvaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                error: &error
            )

            if !available {
                return BiometricsAuthResult(
                    success: false,
                    error: error?.localizedDescription
                )
            }

            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: reason,
            )

            if !success {
                return BiometricsAuthResult(
                    success: false,
                    error: error?.localizedDescription
                )
            }

            return BiometricsAuthResult(success: true, error: nil)
        }
    }

    // func createKeys() throws -> NitroModules.Promise<BiometricsKey> {
    //     <#code#>
    // }

    // func signPayload(payload: String) throws
    //     -> NitroModules.Promise<BiometricsSignature>
    // {
    //     <#code#>
    // }

    // func deleteKeys() throws {
    //     <#code#>
    // }

}
