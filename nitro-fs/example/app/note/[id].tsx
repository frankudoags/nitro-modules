import { Ionicons } from '@expo/vector-icons'
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { deleteNote, getNoteById, saveNote } from '../../src/storage/notesStore'

function decodeParam(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value
  return raw ? decodeURIComponent(raw) : ''
}

export default function NoteDetailScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const params = useLocalSearchParams<{
    id?: string | string[]
    directory?: string | string[]
  }>()

  const noteId = useMemo(() => decodeParam(params.id), [params.id])
  const directoryName = useMemo(
    () => decodeParam(params.directory),
    [params.directory]
  )

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved')
  const lastSyncedRef = useRef('')
  const scrollRef = useRef<ScrollView | null>(null)

  const loadNote = useCallback(async () => {
    if (!directoryName || !noteId) {
      return
    }

    const next = await getNoteById(directoryName, noteId)
    if (!next) {
      setIsLoaded(true)
      return
    }

    const nextKey = `${next.title}\n${next.content}`
    lastSyncedRef.current = nextKey
    setTitle(next.title)
    setContent(next.content)
    setUpdatedAt(next.updatedAt)
    setIsLoaded(true)
  }, [directoryName, noteId])

  useFocusEffect(
    useCallback(() => {
      void loadNote()
    }, [loadNote])
  )

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: title || 'Note',
      })
    }, [navigation, title])
  )

  useFocusEffect(
    useCallback(() => {
      if (!isLoaded || !directoryName || !noteId) {
        return
      }

      const nextKey = `${title}\n${content}`
      if (nextKey === lastSyncedRef.current) {
        return
      }

      setSaveState('saving')
      const timeoutId = setTimeout(() => {
        void saveNote({
          directoryName,
          id: noteId,
          title,
          content,
        }).then((saved) => {
          lastSyncedRef.current = `${saved.title}\n${saved.content}`
          setUpdatedAt(saved.updatedAt)
          setSaveState('saved')
        })
      }, 550)

      return () => {
        clearTimeout(timeoutId)
      }
    }, [content, directoryName, isLoaded, noteId, title])
  )

  if (isLoaded && !lastSyncedRef.current) {
    return (
      <View style={styles.centered}>
        <Text style={styles.mutedText}>This note no longer exists.</Text>
      </View>
    )
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.page}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.actionsRow}>
          <Text style={styles.saveStateText}>
            {saveState === 'saving' ? 'Saving...' : 'Saved'}
          </Text>
          <Pressable
            style={styles.iconButton}
            onPress={() => {
              Alert.alert('Delete note?', 'This action cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    void deleteNote(directoryName, noteId).then(() => {
                      router.replace(`/directory/${encodeURIComponent(directoryName)}`)
                    })
                  },
                },
              ])
            }}
          >
            <Ionicons name='trash-outline' size={18} color='#a63a44' />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode='interactive'
          keyboardShouldPersistTaps='handled'
          automaticallyAdjustKeyboardInsets
        >
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder='Title'
            placeholderTextColor='#7f93af'
            multiline
          />
          <Text style={styles.meta}>
            {updatedAt ? `Updated ${new Date(updatedAt).toLocaleString()}` : 'Not saved yet'}
          </Text>
          <TextInput
            style={styles.bodyInput}
            value={content}
            onChangeText={setContent}
            placeholder='Start writing...'
            placeholderTextColor='#8aa0be'
            multiline
            textAlignVertical='top'
            scrollEnabled={false}
            onFocus={() => {
              requestAnimationFrame(() => {
                scrollRef.current?.scrollToEnd({ animated: true })
              })
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f8fbff',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  saveStateText: {
    color: '#5b7496',
    fontWeight: '600',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e9f1ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#112748',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    color: '#112748',
    marginBottom: 8,
  },
  meta: {
    color: '#617897',
    marginBottom: 16,
  },
  bodyText: {
    color: '#213958',
    lineHeight: 24,
    fontSize: 17,
  },
  bodyInput: {
    color: '#213958',
    lineHeight: 24,
    fontSize: 17,
    minHeight: 320,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fbff',
    paddingHorizontal: 20,
  },
  mutedText: {
    color: '#5c7392',
  },
})
