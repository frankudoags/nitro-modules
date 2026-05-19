import configPlugins from '@expo/config-plugins'
import { createRequire } from 'node:module'

const { createRunOncePlugin, withAndroidManifest } = configPlugins

const VIBRATE_PERMISSION = 'android.permission.VIBRATE'
const require = createRequire(import.meta.url)
const pkg = require('../package.json')

// A config plugin receives Expo config, applies platform mods, and returns config.
const withNitroHaptics = (config) => {
  // withAndroidManifest gives access to the parsed AndroidManifest.xml object.
  return withAndroidManifest(config, (configWithManifest) => {
    const manifest = configWithManifest.modResults.manifest
    const usesPermissions = manifest['uses-permission'] ?? []

    const hasVibratePermission = usesPermissions.some(
      (permission) => permission?.$?.['android:name'] === VIBRATE_PERMISSION
    )

    if (!hasVibratePermission) {
      usesPermissions.push({
        $: {
          'android:name': VIBRATE_PERMISSION,
        },
      })
      manifest['uses-permission'] = usesPermissions
    }

    return configWithManifest
  })
}

// createRunOncePlugin de-duplicates execution by package name + version.
export default createRunOncePlugin(
  withNitroHaptics,
  pkg.name,
  pkg.version
)
