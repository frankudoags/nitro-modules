import 'react-native-reanimated'
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f8fbff' },
        headerShadowVisible: false,
        headerTintColor: '#102039',
        contentStyle: { backgroundColor: '#f8fbff' },
      }}
    >
      <Stack.Screen name='index' options={{ title: 'Notes' }} />
      <Stack.Screen
        name='directory/[name]'
        options={{ title: 'Folder' }}
      />
      <Stack.Screen
        name='note/[id]'
        options={{ title: 'Note' }}
      />
    </Stack>
  )
}
