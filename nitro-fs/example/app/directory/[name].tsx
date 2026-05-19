import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import {
  deleteDirectory,
  listNotes,
  renameDirectory,
  saveNote,
  type NoteItem,
} from '../../src/storage/notesStore'

function decodeName(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value
  return raw ? decodeURIComponent(raw) : ''
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6)
}

export default function FolderNotesScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const params = useLocalSearchParams<{ name?: string | string[] }>()
  const folderName = useMemo(() => decodeName(params.name), [params.name])
  const [query, setQuery] = useState('')
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameDraft, setRenameDraft] = useState('')

  const handleDeleteFolder = useCallback(() => {
    if (notes.length > 0) {
      Alert.alert(
        'Folder has notes',
        `This folder contains ${notes.length} notes. You can cancel, or delete the folder and all its content.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete All Content',
            style: 'destructive',
            onPress: () => {
              void deleteDirectory(folderName).then(() => {
                router.replace({
                  pathname: '/',
                  params: { refreshAt: String(Date.now()) },
                })
              })
            },
          },
        ]
      )
      return
    }

    Alert.alert('Delete empty folder?', folderName, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteDirectory(folderName).then(() => {
            router.replace({
              pathname: '/',
              params: { refreshAt: String(Date.now()) },
            })
          })
        },
      },
    ])
  }, [folderName, notes.length, router])

  const openFolderMenu = useCallback(() => {
    Alert.alert(folderName || 'Folder', 'Folder options', [
      {
        text: 'Rename Folder',
        onPress: () => {
          setRenameDraft(folderName)
          setIsRenaming(true)
        },
      },
      {
        text: 'Delete Folder',
        style: 'destructive',
        onPress: handleDeleteFolder,
      },
      { text: 'Cancel', style: 'cancel' },
    ])
  }, [folderName, handleDeleteFolder])

  const loadNotes = useCallback(async () => {
    if (!folderName) {
      return
    }

    const next = await listNotes(folderName)
    setNotes(next)
  }, [folderName])

  useFocusEffect(
    useCallback(() => {
      void loadNotes()
    }, [loadNotes])
  )

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ title: folderName || 'Folder' })
    }, [folderName, navigation])
  )

  const filteredNotes = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return notes
    }

    return notes.filter((note) => {
      const target = `${note.title}\n${note.content}`.toLowerCase()
      return target.includes(normalized)
    })
  }, [notes, query])

  return (
    <View style={styles.page}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {folderName}
          </Text>
          <Pressable
            style={styles.manageButton}
            onPress={openFolderMenu}
          >
            <Ionicons name='ellipsis-horizontal' size={16} color='#174d8f' />
          </Pressable>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={async () => {
            try {
              const created = await saveNote({
                directoryName: folderName,
                title: `quick-note-${randomSuffix()}`,
                content: '',
              })

              router.push({
                pathname: '/note/[id]',
                params: { id: created.id, directory: folderName },
              })
            } catch (error) {
              Alert.alert('Could not create note', String(error))
            }
          }}
        >
          <Ionicons name='add' size={20} color='#f8fffc' />
        </Pressable>
      </View>

      {isRenaming ? (
        <View style={styles.renameRow}>
          <TextInput
            style={styles.renameInput}
            value={renameDraft}
            onChangeText={setRenameDraft}
            autoCapitalize='none'
          />
          <Pressable
            style={styles.renameSaveButton}
            onPress={async () => {
              const trimmed = renameDraft.trim()
              if (!trimmed) {
                return
              }

              try {
                const renamed = await renameDirectory(folderName, trimmed)
                setIsRenaming(false)
                router.replace(`/directory/${encodeURIComponent(renamed)}`)
              } catch (error) {
                Alert.alert('Could not rename folder', String(error))
              }
            }}
          >
            <Text style={styles.renameSaveText}>Save</Text>
          </Pressable>
          <Pressable
            style={styles.renameCancelButton}
            onPress={() => {
              setIsRenaming(false)
              setRenameDraft(folderName)
            }}
          >
            <Text style={styles.renameCancelText}>Cancel</Text>
          </Pressable>
        </View>
      ) : null}

      <TextInput
        style={styles.searchInput}
        placeholder='Search notes'
        placeholderTextColor='#7487a3'
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 45).duration(220)}>
            <Pressable
              style={styles.row}
              onPress={() =>
                router.push({
                  pathname: '/note/[id]',
                  params: { id: item.id, directory: folderName },
                })
              }
            >
              <View style={styles.rowLeft}>
                <View style={styles.noteIconWrap}>
                  <Ionicons name='document-text-outline' size={16} color='#5b7598' />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.noteTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.previewText} numberOfLines={1}>
                    {item.content || 'No content yet'}
                  </Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.meta}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
                <Ionicons name='chevron-forward' size={16} color='#8194ae' />
              </View>
            </Pressable>
          </Animated.View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {notes.length > 0
              ? 'No matches for that search.'
              : 'No notes yet. Tap the plus icon to add one.'}
          </Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#102039',
    flexShrink: 1,
    textTransform: 'capitalize',
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f5b340',
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8eef7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  renameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  renameInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    color: '#102039',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  renameSaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0e8a67',
  },
  renameSaveText: {
    color: '#f8fffc',
    fontWeight: '700',
  },
  renameCancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#e8eef7',
  },
  renameCancelText: {
    color: '#2a4568',
    fontWeight: '600',
  },
  searchInput: {
    borderWidth: 0,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    color: '#102039',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  listContent: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    paddingBottom: 24,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e4e4ea',
    marginLeft: 56,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  noteIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eef2f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#122541',
  },
  previewText: {
    color: '#3f5472',
    marginTop: 2,
  },
  meta: {
    color: '#4b5f7b',
    fontSize: 12,
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#4b5f7b',
  },
})
