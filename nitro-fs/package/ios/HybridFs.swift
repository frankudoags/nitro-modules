import Foundation
import NitroModules

class HybridFs: HybridFsSpec {
    var documentsDirectory: String
    
    var cacheDirectory: String
    
    var tempDirectory: String
    
    override init() {
        documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.path ?? ""
        cacheDirectory = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first?.path ?? ""
        tempDirectory = NSTemporaryDirectory()
    }
    
    func readFile(path: String) throws -> NitroModules.Promise<String> {
        Promise.async {
            return try String(contentsOfFile: path, encoding: .utf8)
        }
    }
    
    func writeFile(path: String, content: String) throws -> NitroModules.Promise<Void> {
        Promise.async {
            try content.write(toFile: path, atomically: true, encoding: .utf8)
        }
    }
    
    func deleteFile(path: String) throws -> NitroModules.Promise<Void> {
        Promise.async {
            try FileManager.default.removeItem(atPath: path)
        }
    }
    
    func mkdir(path: String) throws -> NitroModules.Promise<Void> {
        Promise.async {
            try FileManager.default.createDirectory(atPath: path, withIntermediateDirectories: true, attributes: nil)
        }
    }
    
    func readDir(path: String) throws -> NitroModules.Promise<[FileEntry]> {
        Promise.async {
            let contents = try FileManager.default.contentsOfDirectory(atPath: path)
            return contents.map { name in 
                let fullPath = (path as NSString).appendingPathComponent(name)
                let attributes = try? FileManager.default.attributesOfItem(atPath: fullPath)
                let isDirectory = (attributes?[.type] as? FileAttributeType) == .typeDirectory
                let size = attributes?[.size] as? UInt64 ?? 0
                let lastModified = (attributes?[.modificationDate] as? Date)?.timeIntervalSince1970 ?? 0

                return FileEntry(name: name, path: fullPath, isDirectory: isDirectory, size: Double(size), lastModified: lastModified)
            }
            
        }
    }
    
    func exists(path: String) throws -> NitroModules.Promise<Bool> {
        Promise.async {
            return FileManager.default.fileExists(atPath: path)
        }
    }
    
    func move(srcPath: String, destPath: String) throws -> NitroModules.Promise<Void> {
        Promise.async {
            try FileManager.default.moveItem(atPath: srcPath, toPath: destPath)
        }
    }
    
    func copy(srcPath: String, destPath: String) throws -> NitroModules.Promise<Void> {
        Promise.async {
            try FileManager.default.copyItem(atPath: srcPath, toPath: destPath)
        }
    }
    
    
}
