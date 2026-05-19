import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
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
} from 'react-native'
import { getNoteById, saveNote } from '../../src/storage/notesStore'

function decodeParam(param: string | string[] | undefined): string {
  const value = Array.isArray(param) ? param[0] : param
  return value ? decodeURIComponent(value) : ''
}

export default function NoteModal() {
  const params = useLocalSearchParams<{
    directory?: string | string[]
    id?: string | string[]
  }>()
  const navigation = useNavigation()
  const directoryName = useMemo(
    () => decodeParam(params.directory),
    [params.directory]
  )
  const noteId = useMemo(() => decodeParam(params.id), [params.id])
  const isEditing = noteId.length > 0
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const scrollRef = useRef<ScrollView | null>(null)

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Note' : 'New Note',
    })
  }, [isEditing, navigation])

  useEffect(() => {
    if (!directoryName || !noteId) {
      return
    }

    let isActive = true

    const load = async () => {
      const note = await getNoteById(directoryName, noteId)
      if (!isActive || !note) {
        return
      }

      setTitle(note.title)
      setContent(note.content)
    }

    void load()

    return () => {
      isActive = false
    }
  }, [directoryName, noteId])

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.page}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.modalContent}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='interactive'
          automaticallyAdjustKeyboardInsets
        >
          <Text style={styles.directoryTag}>{directoryName || 'Folder'}</Text>

          <TextInput
            style={styles.input}
            placeholder='Title'
            placeholderTextColor='#7487a3'
            value={title}
            onChangeText={setTitle}
            returnKeyType='done'
            autoCapitalize='none'
            spellCheck={false}
            onSubmitEditing={Keyboard.dismiss}
          />

          <TextInput
            style={styles.textArea}
            placeholder='Write your note...'
            placeholderTextColor='#7487a3'
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical='top'
            returnKeyType='done'
            blurOnSubmit
            onSubmitEditing={Keyboard.dismiss}
            onFocus={() => {
              requestAnimationFrame(() => {
                scrollRef.current?.scrollToEnd({ animated: true })
              })
            }}
          />

          <Pressable
            style={styles.primaryButton}
            onPress={async () => {
              if (!directoryName) {
                Alert.alert(
                  'Missing folder',
                  'Open this modal from a folder screen.'
                )
                return
              }

              try {
                await saveNote({
                  directoryName,
                  id: noteId || undefined,
                  title,
                  content,
                })
                router.back()
              } catch (error) {
                Alert.alert('Could not save note', String(error))
              }
            }}
          >
            <Text style={styles.primaryButtonText}>
              {isEditing ? 'Update Note' : 'Save Note'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f8fbff',
    padding: 16,
  },
  modalContent: {
    paddingBottom: 12,
  },
  directoryTag: {
    color: '#3f5472',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d6e3f8',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    color: '#102039',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d6e3f8',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    color: '#102039',
    paddingHorizontal: 12,
    paddingTop: 10,
    marginBottom: 14,
    minHeight: 260,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: '#0e8a67',
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#f8fffc',
    fontWeight: '700',
  },
})
