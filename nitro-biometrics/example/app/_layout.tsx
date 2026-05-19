import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#f8f9fa' },
          headerTintColor: '#1a1a2e',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: '#f8f9fa' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
