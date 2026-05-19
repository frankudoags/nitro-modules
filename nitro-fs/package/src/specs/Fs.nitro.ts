import type { HybridObject } from 'react-native-nitro-modules'

export interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
  size: number
  lastModified: number
}

export interface Fs extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  // Constants
  readonly documentsDirectory: string
  readonly cacheDirectory: string
  readonly tempDirectory: string

  // File system operations
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  deleteFile(path: string): Promise<void>

  // Directory operations
  mkdir(path: string): Promise<void>
  readDir(path: string): Promise<FileEntry[]>

  // Utility methods
  exists(path: string): Promise<boolean>
  move(srcPath: string, destPath: string): Promise<void>
  copy(srcPath: string, destPath: string): Promise<void>
}
