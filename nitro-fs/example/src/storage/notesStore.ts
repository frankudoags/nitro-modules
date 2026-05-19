import fs from 'nitro-fs'

const ROOT_DIRECTORY = 'nitro-fs-notes'
const NOTE_EXTENSION = '.note.json'
const TRASH_DIRECTORY = '.trash'

export type NoteItem = {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

export type DirectorySummary = {
  name: string
  path: string
  noteCount: number
  lastUpdated: number
}

function joinPath(base: string, segment: string): string {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedSegment = segment.startsWith('/') ? segment.slice(1) : segment
  return `${normalizedBase}/${normalizedSegment}`
}

function toSafeDirectoryName(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-').toLowerCase()
}

function notePath(directoryPath: string, noteId: string): string {
  return joinPath(directoryPath, `${noteId}${NOTE_EXTENSION}`)
}

function generateId(): string {
  return `${Date.now()}-${Math.round(Math.random() * 100_000)}`
}

function withUniqueSuffix(name: string): string {
  return `${name}-${Date.now()}`
}

async function getDirectoryPath(directoryName: string): Promise<string> {
  const rootPath = await ensureRootDirectory()
  const safeDirectory = toSafeDirectoryName(directoryName)
  return joinPath(rootPath, safeDirectory)
}

async function ensureDirectoryExists(directoryPath: string): Promise<void> {
  const hasDir = await fs.exists(directoryPath)
  if (!hasDir) {
    await fs.mkdir(directoryPath)
  }
}

export async function getRootDirectoryPath(): Promise<string> {
  return joinPath(fs.documentsDirectory, ROOT_DIRECTORY)
}

export async function ensureRootDirectory(): Promise<string> {
  const rootPath = await getRootDirectoryPath()
  const hasRoot = await fs.exists(rootPath)
  if (!hasRoot) {
    await fs.mkdir(rootPath)
  }
  return rootPath
}

export async function listNotes(directoryName: string): Promise<NoteItem[]> {
  const safeDirectory = toSafeDirectoryName(directoryName)
  const dirPath = await getDirectoryPath(safeDirectory)
  const hasDir = await fs.exists(dirPath)

  if (!hasDir) {
    return []
  }

  const entries = await fs.readDir(dirPath)
  const noteFiles = entries.filter(
    (entry) => !entry.isDirectory && entry.name.endsWith(NOTE_EXTENSION)
  )

  const notes = await Promise.all(
    noteFiles.map(async (entry) => {
      const raw = await fs.readFile(entry.path)
      const parsed = JSON.parse(raw) as NoteItem
      return parsed
    })
  )

  return notes.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getNoteById(
  directoryName: string,
  id: string
): Promise<NoteItem | null> {
  const notes = await listNotes(directoryName)
  return notes.find((note) => note.id === id) ?? null
}

export async function listDirectories(): Promise<DirectorySummary[]> {
  const rootPath = await ensureRootDirectory()
  const entries = await fs.readDir(rootPath)
  const dirs = entries.filter((entry) => entry.isDirectory && !entry.name.startsWith('.'))

  const withCounts = await Promise.all(
    dirs.map(async (directory) => {
      const notes = await listNotes(directory.name)
      const lastUpdated = notes.length > 0 ? notes[0].updatedAt : 0

      return {
        name: directory.name,
        path: directory.path,
        noteCount: notes.length,
        lastUpdated,
      } satisfies DirectorySummary
    })
  )

  return withCounts.sort((a, b) => {
    if (a.lastUpdated === b.lastUpdated) {
      return a.name.localeCompare(b.name)
    }
    return b.lastUpdated - a.lastUpdated
  })
}

export async function createDirectory(name: string): Promise<string> {
  const rootPath = await ensureRootDirectory()
  const safeName = toSafeDirectoryName(name)

  if (!safeName) {
    throw new Error('Directory name cannot be empty.')
  }

  const dirPath = joinPath(rootPath, safeName)
  const hasDir = await fs.exists(dirPath)

  if (!hasDir) {
    await fs.mkdir(dirPath)
  }

  return safeName
}

export async function renameDirectory(currentName: string, nextName: string): Promise<string> {
  const safeCurrent = toSafeDirectoryName(currentName)
  const safeNext = toSafeDirectoryName(nextName)

  if (!safeCurrent) {
    throw new Error('Current directory name is invalid.')
  }

  if (!safeNext) {
    throw new Error('New directory name cannot be empty.')
  }

  if (safeCurrent === safeNext) {
    return safeCurrent
  }

  const currentPath = await getDirectoryPath(safeCurrent)
  const nextPath = await getDirectoryPath(safeNext)

  const hasCurrent = await fs.exists(currentPath)
  if (!hasCurrent) {
    throw new Error('Directory does not exist.')
  }

  const hasTarget = await fs.exists(nextPath)
  if (hasTarget) {
    throw new Error('A directory with that name already exists.')
  }

  await fs.move(currentPath, nextPath)
  return safeNext
}

export async function deleteDirectory(directoryName: string): Promise<void> {
  const rootPath = await ensureRootDirectory()
  const safeDirectory = toSafeDirectoryName(directoryName)

  if (!safeDirectory) {
    throw new Error('Directory name is invalid.')
  }

  const dirPath = joinPath(rootPath, safeDirectory)
  const hasDir = await fs.exists(dirPath)
  if (!hasDir) {
    return
  }

  const trashRoot = joinPath(rootPath, TRASH_DIRECTORY)
  await ensureDirectoryExists(trashRoot)

  const trashPath = joinPath(trashRoot, withUniqueSuffix(safeDirectory))
  await fs.move(dirPath, trashPath)
}

export async function saveNote(params: {
  directoryName: string
  id?: string
  title: string
  content: string
}): Promise<NoteItem> {
  const safeDirectory = toSafeDirectoryName(params.directoryName)
  const dirPath = await getDirectoryPath(safeDirectory)
  await ensureDirectoryExists(dirPath)

  const now = Date.now()
  const id = params.id ?? generateId()

  let existing: NoteItem | null = null
  const filePath = notePath(dirPath, id)
  const hasNote = await fs.exists(filePath)
  if (hasNote) {
    const raw = await fs.readFile(filePath)
    existing = JSON.parse(raw) as NoteItem
  }

  const note: NoteItem = {
    id,
    title: params.title.trim() || 'Untitled',
    content: params.content,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  await fs.writeFile(filePath, JSON.stringify(note))
  return note
}

export async function deleteNote(directoryName: string, id: string): Promise<void> {
  const safeDirectory = toSafeDirectoryName(directoryName)
  const dirPath = await getDirectoryPath(safeDirectory)
  const filePath = notePath(dirPath, id)
  const hasNote = await fs.exists(filePath)

  if (hasNote) {
    await fs.deleteFile(filePath)
  }
}

export async function copyNoteToDirectory(params: {
  sourceDirectory: string
  targetDirectory: string
  id: string
}): Promise<NoteItem> {
  const safeSource = toSafeDirectoryName(params.sourceDirectory)
  const safeTarget = toSafeDirectoryName(params.targetDirectory)
  const sourcePath = notePath(await getDirectoryPath(safeSource), params.id)
  const sourceExists = await fs.exists(sourcePath)

  if (!sourceExists) {
    throw new Error('Source note does not exist.')
  }

  const targetDirectoryPath = await getDirectoryPath(safeTarget)
  await ensureDirectoryExists(targetDirectoryPath)

  const raw = await fs.readFile(sourcePath)
  const sourceNote = JSON.parse(raw) as NoteItem
  const copiedId = generateId()
  const copiedPath = notePath(targetDirectoryPath, copiedId)

  await fs.copy(sourcePath, copiedPath)

  const now = Date.now()
  const copiedNote: NoteItem = {
    ...sourceNote,
    id: copiedId,
    createdAt: now,
    updatedAt: now,
  }

  await fs.writeFile(copiedPath, JSON.stringify(copiedNote))
  return copiedNote
}

export async function moveNoteToDirectory(params: {
  sourceDirectory: string
  targetDirectory: string
  id: string
}): Promise<NoteItem> {
  const safeSource = toSafeDirectoryName(params.sourceDirectory)
  const safeTarget = toSafeDirectoryName(params.targetDirectory)

  if (safeSource === safeTarget) {
    throw new Error('Choose a different destination directory.')
  }

  const sourceDirectoryPath = await getDirectoryPath(safeSource)
  const targetDirectoryPath = await getDirectoryPath(safeTarget)
  await ensureDirectoryExists(targetDirectoryPath)

  const sourcePath = notePath(sourceDirectoryPath, params.id)
  const sourceExists = await fs.exists(sourcePath)
  if (!sourceExists) {
    throw new Error('Source note does not exist.')
  }

  let nextId = params.id
  let targetPath = notePath(targetDirectoryPath, nextId)
  const targetExists = await fs.exists(targetPath)
  if (targetExists) {
    nextId = generateId()
    targetPath = notePath(targetDirectoryPath, nextId)
  }

  await fs.move(sourcePath, targetPath)

  const movedRaw = await fs.readFile(targetPath)
  const movedNote = JSON.parse(movedRaw) as NoteItem
  const nextNote: NoteItem = {
    ...movedNote,
    id: nextId,
    updatedAt: Date.now(),
  }

  await fs.writeFile(targetPath, JSON.stringify(nextNote))
  return nextNote
}

export async function seedDemoContent(): Promise<void> {
  const directories = await listDirectories()
  if (directories.length > 0) {
    return
  }

  const defaultFolder = 'nitro-module-notes'
  await createDirectory(defaultFolder)

  const seedNotes: Array<{ title: string; content: string }> = [
    {
      title: 'nitro-prefs: Key-value storage',
      content:
        'Concepts learned:\n- Promise.async\n- nullable variants\n- NullType.null\n- typed keys\n- DataStore coroutines\n\nFirst module. Learned full Nitro workflow: spec -> nitrogen -> implement. Nullable returns use Variant types (first/second). iOS wraps sync UserDefaults in Promise.async. Android DataStore is natively async via coroutines.\n\niOS:\n- UserDefaults.standard\n\nAndroid:\n- PreferenceDataStoreFactory',
    },
    {
      title: 'nitro-haptics: Device vibration',
      content:
        'Concepts learned:\n- enums in specs\n- void methods\n- no async needed\n- method vs property syntax\n\nFirst fire-and-forget module. Enums in TS become native enums on both platforms. Method syntax trigger(style) vs property syntax matters to Nitrogen. iOS uses separate generator classes. Android approximates with predefined effects plus duration fallbacks.\n\niOS:\n- UIImpactFeedbackGenerator\n- UINotificationFeedbackGenerator\n- UISelectionFeedbackGenerator\n\nAndroid:\n- VibrationEffect.createPredefined() + legacy fallback',
    },
    {
      title: 'nitro-clipboard: Read/write clipboard',
      content:
        'Concepts learned:\n- sync vs async decision\n- nullable string return\n- singleton APIs\n\nSimple but important lesson: question whether async is needed. Both platforms are synchronous. iOS uses a singleton. Android needs context to get ClipboardManager via getSystemService.\n\niOS:\n- UIPasteboard.general\n\nAndroid:\n- ClipboardManager via getSystemService',
    },
    {
      title: 'nitro-battery: Battery info + events',
      content:
        'Concepts learned:\n- event subscriptions\n- callback storage\n- ID-based unsubscribe\n- @objc + NotificationCenter\n- BroadcastReceiver\n- register/unregister lifecycle\n\nFirst event-driven module. Native pushes data to JS instead of JS polling. iOS uses NotificationCenter and exposes Swift methods to Obj-C runtime. Android uses BroadcastReceiver. Both must unregister observers to avoid memory leaks. Register on first subscriber, unregister on last.\n\niOS:\n- UIDevice + NotificationCenter\n\nAndroid:\n- BatteryManager + BroadcastReceiver',
    },
    {
      title: 'nitro-fs: Filesystem access',
      content:
        'Concepts learned:\n- structs across bridge\n- arrays of structs\n- readonly constants\n- app sandbox\n- error throwing\n- override init()\n\nFirst module with structs and arrays. FileEntry passes complex typed data across the bridge. Apps are sandboxed, so only app-owned directories are accessible. Constants exposed as readonly properties help JS build safe paths. File IO always runs on background thread.\n\niOS:\n- FileManager.default\n\nAndroid:\n- java.io.File + context.filesDir',
    },
  ]

  for (const note of seedNotes) {
    await saveNote({
      directoryName: defaultFolder,
      title: note.title,
      content: note.content,
    })
  }
}
