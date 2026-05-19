import Foundation
import NitroModules

class HybridClipboard: HybridClipboardSpec {
    func read() throws -> ClipboardReadResult {
        if let string = UIPasteboard.general.string {
            return .second(string)
        } else {
            return .first(NullType.null)
        }
    }
    
    func write(text: String) throws {
        UIPasteboard.general.string = text
    }
    
}
