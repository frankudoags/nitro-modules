# react-native-nitro-biometrics

A Simple Nitro module to authenticate users with biometrics on iOS and Android.


## Installation

> [!IMPORTANT]  
> This package requires `react-native-nitro-modules` to be installed first.
> See [react-native-nitro-modules](https://github.com/mrousavy/nitro) for more information.

```sh
pnpm install react-native-nitro-biometrics react-native-nitro-modules
cd ios && pod install && cd ..
```

For expo users, this package ships with a config plugin that automatically adds the necessary permissions to your app. To use it, simply add the following to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      ...other plugins,
      [
        "react-native-nitro-biometrics",
        {
          "faceIDPermission": "Allow this app to use Face ID"
        }
      ]
    ]
  }
}
```

For bare or vanilla React Native users, you need to add the following permissions to your app:
### iOS

Add the following to your `Info.plist`:

```xml
<key>NSFaceIDUsageDescription</key>
<string>Allow this app to use Face ID</string>
```

### Android
Add the following to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

## Usage

See the example app for usage instructions.

## License

MIT


## Credits

This package is based on the work of [expo-local-authentication](https://github.com/expo/expo/tree/main/packages/expo-local-authentication/) with some code being copied verbatim and some being adapted to work with my preferences. The original license for that package is MIT, which is compatible with this package's license. See the [expo](https://github.com/expo/expo/blob/main/LICENSE) repository for more information.