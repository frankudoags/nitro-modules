//
//  HybridNitroBiometrics.swift
//  Pods
//
//  Created by frankudoags on 5/19/2026.
//

import Foundation
import NitroModules

class HybridNitroBiometrics: HybridNitroBiometricsSpec {
    func isAvailable() throws -> BiometricsAvailability {
        
    }
    
    func authenticate(reason: String) throws -> NitroModules.Promise<BiometricsAuthResult> {
        <#code#>
    }
    
    func createKeys() throws -> NitroModules.Promise<BiometricsKey> {
        <#code#>
    }
    
    func signPayload(payload: String) throws -> NitroModules.Promise<BiometricsSignature> {
        <#code#>
    }
    
    func deleteKeys() throws {
        <#code#>
    }
    
    
}
