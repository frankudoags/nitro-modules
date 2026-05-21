import Foundation
import LocalAuthentication
import NitroModules
import Security

class HybridNitroBiometrics: HybridNitroBiometricsSpec {
    // MARK: - Constants

    private var keyTag: String {
        let bundleId =
            Bundle.main.bundleIdentifier
            ?? "com.nitrobiometrics"

        return "\(bundleId).biometrics.key"
    }

    private let keyType =
        kSecAttrKeyTypeECSECPrimeRandom

    private let keySize = 256

    // MARK: - Module functions

    func isAvailable() throws
        -> BiometricsAvailability
    {
        let context = makeContext()

        var error: NSError?

        let available = context.canEvaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            error: &error
        )

        guard available else {
            return BiometricsAvailability(
                isAvailable: false,
                biometryType: .first(.null),
                error: mapError(error)
            )
        }

        let type = getBiometryType(context)
        
        if type == nil {
            return BiometricsAvailability(
                isAvailable: false,
                biometryType: .first(.null),
                error: BiometricsError.notAvailable
            )
        }

        return BiometricsAvailability(
            isAvailable: true,
            biometryType: .second(type!),
            error: nil
        )
    }

    func supportedAuthenticationTypes() throws -> [BiometryType] {
        <#code#>
    }

    func isEnrolled() throws -> Bool {
        <#code#>
    }

    func getPermissionsAsync() throws
        -> NitroModules.Promise<BiometricsPermissionResponse>
    {
        <#code#>
    }

    func requestPermissionsAsync(reason: String) throws
        -> NitroModules.Promise<BiometricsPermissionResponse>
    {
        <#code#>
    }

    func authenticate(reason: String, options: AuthenticateOptions?) throws
        -> NitroModules.Promise<BiometricsAuthResult>
    {
        <#code#>
    }

    func createKeys(options: CreateKeysOptions?) throws
        -> NitroModules.Promise<BiometricsKey>
    {
        <#code#>
    }

    func keysExist() throws -> Bool {
        <#code#>
    }

    func getPublicKey() throws
        -> NitroModules.Promise<Variant_NullType_BiometricsKey>
    {
        <#code#>
    }

    func deleteKeys() throws {
        <#code#>
    }

    func signPayload(payload: String, options: AuthenticateOptions?) throws
        -> NitroModules.Promise<BiometricsSignature>
    {
        <#code#>
    }

    // MARK: - Helpers

    private func makeContext() -> LAContext {
        let context = LAContext()

        context.localizedCancelTitle = "Cancel"

        return context
    }

    private func getBiometryType(
        _ context: LAContext
    ) -> BiometryType? {

        switch context.biometryType {

        case .faceID:
            return .faceId

        case .touchID:
            return .touchId

        case .opticID:
            return .iris

        default:
            return nil
        }
    }

    private func mapError(
        _ error: Error?
    ) -> BiometricsError {

        guard
            let laError =
                error as? LAError
        else {
            return .unknown
        }

        switch laError.code {

        case .userCancel:
            return .userCancel

        case .systemCancel:
            return .systemCancel

        case .biometryNotAvailable:
            return .notAvailable

        case .biometryNotEnrolled:
            return .notEnrolled

        case .biometryLockout:
            return .lockout

        case .authenticationFailed:
            return .authenticationFailed

        default:
            return .unknown
        }
    }

    private func makeAccessControl(
        invalidateOnEnrollmentChange: Bool
    ) throws -> SecAccessControl {

        let flags: SecAccessControlCreateFlags =
            invalidateOnEnrollmentChange
            ? [.privateKeyUsage, .biometryCurrentSet]
            : [.privateKeyUsage, .biometryAny]

        var error: Unmanaged<CFError>?

        guard
            let accessControl =
                SecAccessControlCreateWithFlags(
                    nil,
                    kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
                    flags,
                    &error
                )
        else {
            throw error!.takeRetainedValue()
        }

        return accessControl
    }

    private func getPrivateKey() throws
        -> SecKey
    {
        try getPrivateKey(context: nil)
    }

    private func getPrivateKey(
        context: LAContext?
    ) throws -> SecKey {
        var query: [String: Any] = [
            kSecClass as String:
                kSecClassKey,

            kSecAttrApplicationTag as String:
                keyTag.data(using: .utf8)!,

            kSecAttrKeyType as String:
                keyType,

            kSecReturnRef as String:
                true,
        ]

        if let context {
            query[kSecUseAuthenticationContext as String] = context
        }

        var item: CFTypeRef?

        let status = SecItemCopyMatching(
            query as CFDictionary,
            &item
        )

        guard status == errSecSuccess else {
            throw NSError(
                domain: NSOSStatusErrorDomain,
                code: Int(status)
            )
        }

        return item as! SecKey
    }

    private func exportPublicKey(
        _ key: SecKey
    ) throws -> String {
        var error: Unmanaged<CFError>?

        guard
            let data =
                SecKeyCopyExternalRepresentation(
                    key,
                    &error
                )
        else {
            throw error!.takeRetainedValue()
        }

        return (data as Data)
            .base64EncodedString()
    }
}

// MARK: - Async LAContext

extension LAContext {

    fileprivate func evaluatePolicyAsync(
        _ policy: LAPolicy,
        localizedReason reason: String
    ) async throws -> Bool {

        try await withCheckedThrowingContinuation {
            continuation in

            self.evaluatePolicy(
                policy,
                localizedReason: reason
            ) { success, error in

                if let error {
                    continuation.resume(
                        throwing: error
                    )
                } else {
                    continuation.resume(
                        returning: success
                    )
                }
            }
        }
    }
}
