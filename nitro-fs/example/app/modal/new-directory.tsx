import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { createDirectory } from '../../src/storage/notesStore'

export default function NewDirectoryModal() {
  const router = useRouter()
  const [name, setName] = useState('')

  return (
    <View style={styles.page}>
      <Text style={styles.label}>Folder Name</Text>
      <TextInput
        style={styles.input}
        placeholder='work'
        placeholderTextColor='#7487a3'
        value={name}
        onChangeText={setName}
        autoCapitalize='none'
      />
      <Pressable
        style={styles.primaryButton}
        onPress={async () => {
          const trimmed = name.trim()
          if (!trimmed) {
            return
          }

          try {
            await createDirectory(trimmed)
            router.back()
          } catch (error) {
            Alert.alert('Could not create folder', String(error))
          }
        }}
      >
        <Text style={styles.primaryButtonText}>Create Folder</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f8fbff',
    padding: 16,
  },
  label: {
    color: '#223a5c',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d6e3f8',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    color: '#102039',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: '#0e8a67',
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  primaryButtonText: {
    color: '#f8fffc',
    fontWeight: '700',
  },
})
