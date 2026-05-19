import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import clipboard from 'nitro-clipboard'

export default function App() {
  const [inputText, setInputText] = useState('Hello from Nitro Clipboard!')
  const [clipboardValue, setClipboardValue] = useState<string | null>(null)
  const [status, setStatus] = useState('Ready')

  const handleWrite = () => {
    clipboard.write(inputText)
    setStatus('Wrote text to clipboard')
  }

  const handleRead = () => {
    const value = clipboard.read()
    setClipboardValue(value)
    setStatus(value ? 'Read clipboard successfully' : 'Clipboard is empty')
  }

  const handleClear = () => {
    clipboard.write('')
    setClipboardValue('')
    setStatus('Cleared clipboard')
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.title}>Nitro Clipboard Example</Text>
        <Text style={styles.subtitle}>
          Write any text to the system clipboard, then read it back.
        </Text>

        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type text to copy"
          style={styles.input}
          multiline
        />

        <View style={styles.buttonRow}>
          <Pressable style={[styles.button, styles.primaryButton]} onPress={handleWrite}>
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Write</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={handleRead}>
            <Text style={styles.buttonText}>Read</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={handleClear}>
            <Text style={styles.buttonText}>Clear</Text>
          </Pressable>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Clipboard value</Text>
          <Text style={styles.resultValue}>
            {clipboardValue === null
              ? 'Not read yet'
              : clipboardValue.length === 0
                ? '(empty string)'
                : clipboardValue}
          </Text>
        </View>

        <Text style={styles.statusText}>Status: {status}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10243e',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#445f7d',
  },
  input: {
    marginTop: 20,
    minHeight: 96,
    borderWidth: 1,
    borderColor: '#c8d4e2',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 14,
    fontSize: 16,
    color: '#122336',
    textAlignVertical: 'top',
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c8d4e2',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: '#1f6feb',
    borderColor: '#1f6feb',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a3555',
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  resultCard: {
    marginTop: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d7e1eb',
    backgroundColor: '#ffffff',
    padding: 14,
    minHeight: 100,
  },
  resultLabel: {
    fontSize: 13,
    color: '#5f7894',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 16,
    lineHeight: 23,
    color: '#10243e',
  },
  statusText: {
    marginTop: 14,
    fontSize: 14,
    color: '#395979',
  },
})
