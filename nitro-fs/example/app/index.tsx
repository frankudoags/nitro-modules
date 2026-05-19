import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import {
  createDirectory,
  listDirectories,
  seedDemoContent,
  type DirectorySummary,
} from '../src/storage/notesStore'

function formatTime(timestamp: number): string {
  if (!timestamp) {
    return 'No notes yet'
  }

  return new Date(timestamp).toLocaleDateString()
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6)
}

export default function DirectoriesScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ refreshAt?: string }>()
  const refreshAt = params.refreshAt ?? ''
  const [directories, setDirectories] = useState<DirectorySummary[]>([])

  const load = useCallback(async () => {
    await seedDemoContent()
    const next = await listDirectories()
    setDirectories(next)
  }, [refreshAt])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load])
  )

  return (
    <View style={styles.page}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Folders</Text>
        <Pressable
          style={styles.addButton}
          onPress={async () => {
            const folderName = `new-folder-${randomSuffix()}`
            try {
              const created = await createDirectory(folderName)
              router.push(`/directory/${encodeURIComponent(created)}`)
            } catch (error) {
              Alert.alert('Could not create folder', String(error))
            }
          }}
        >
          <Ionicons name='add' size={20} color='#f8fffc' />
        </Pressable>
      </View>

      <FlatList
        data={directories}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 55).duration(240)}>
            <Pressable
              style={styles.row}
              onPress={() => router.push(`/directory/${encodeURIComponent(item.name)}`)}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconWrap}>
                  <Ionicons name='folder' size={18} color='#f5a623' />
                </View>
                <View>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.meta}>{item.noteCount} notes</Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.meta}>{formatTime(item.lastUpdated)}</Text>
                <Ionicons name='chevron-forward' size={16} color='#8194ae' />
              </View>
            </Pressable>
          </Animated.View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No folders yet. Tap + to create one.</Text>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#102039',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0e8a67',
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff6df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 17,
    color: '#122541',
    fontWeight: '700',
  },
  meta: {
    color: '#4b5f7b',
    marginTop: 4,
  },
  cardFooter: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#4b5f7b',
  },
})
