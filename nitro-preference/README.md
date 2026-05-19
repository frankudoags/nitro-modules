# Nitro Preferences

A simple, type-safe key-value storage library for React Native, built with [Nitro modules](https://github.com/mrousavy/nitro).

## How It Works

### iOS (UserDefaults)
Uses iOS's built-in `UserDefaults` system, which stores data persistently in a `.plist` file on device. Data survives app restarts and updates. It's optimized for small amounts of data and is the standard way to store user preferences in iOS apps.

### Android (DataStore)
Uses Android's modern `DataStore` API (specifically `PreferencesDataStore`), which replaces the older `SharedPreferences`. Data is stored in a protobuf file, offering type-safe, transactional storage that handles data corruption gracefully. It uses Kotlin coroutines for async operations.

## Features

- Async key-value storage (string, number, boolean)
- iOS (Swift) and Android (Kotlin) native implementation
- Type-safe API with TypeScript
- Zero-config setup

## Testing

Clone the repo and run the example app:

```bash
git clone <repo-url>
cd nitro-preference
pnpm install
cd example
pnpm ios  # or pnpm android
```

## Usage

```typescript
import { Preference } from 'nitro-preferences'

// Set values
await Preference.setString('username', 'john')
await Preference.setNumber('age', 25)
await Preference.setBool('isLoggedIn', true)

// Get values
const username = await Preference.getString('username') // string | null
const age = await Preference.getNumber('age') // number | null
const isLoggedIn = await Preference.getBool('isLoggedIn') // boolean | null

// Remove a key
await Preference.remove('username')

// Clear all
await Preference.clear()
```

## API

| Method | Returns |
|--------|---------|
| `getString(key)` | `Promise<string \| null>` |
| `setString(key, value)` | `Promise<void>` |
| `getNumber(key)` | `Promise<number \| null>` |
| `setNumber(key, value)` | `Promise<void>` |
| `getBool(key)` | `Promise<boolean \| null>` |
| `setBool(key, value)` | `Promise<void>` |
| `remove(key)` | `Promise<void>` |
| `clear()` | `Promise<void>` |

## License

MIT
