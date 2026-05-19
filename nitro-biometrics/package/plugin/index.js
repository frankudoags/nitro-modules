import configPlugins from '@expo/config-plugins'
import { createRequire } from 'node:module'

const { withInfoPlist } = configPlugins

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

// we need to accept options here so that we can pass them to the native code via the app config
// we need to accept thE NSFaceIDUsageDescription as a user defined option here so that we can add it to the info.plist on iOS
const withNitroBiometricsNSFaceIDUsageDescription = (config, options) => {
  // if the user doesn't specify a custom NSFaceIDUsageDescription, we'll add a default one to prevent the app from crashing on iOS when trying to use Face ID
  // but we also need to add a warning to the console to let the user know that they should add a custom NSFaceIDUsageDescription to their app config to provide a better user experience
  return withInfoPlist(config, (config) => {
    if (!options.faceIDUsageDescription) {
      console.warn(
        `\n\n nitro-biometrics(expo-config-plugin): No custom NSFaceIDUsageDescription provided. Using default description: "This app uses Face ID to authenticate the user". Please provide a custom NSFaceIDUsageDescription in your app config for a better user experience.
        To fix this warning, add the following to your app config:\n\n

        "plugins": [
          [
            "nitro-biometrics",
            {
              "faceIDUsageDescription": "Your custom description here"
            }
          ]
        ]
        `
      )
    }
    config.modResults.NSFaceIDUsageDescription =
      options.faceIDUsageDescription ||
      'This app uses Face ID to authenticate the user'
    return config
  })
}

export default (config, options) => {
  return withNitroBiometricsNSFaceIDUsageDescription(config, options)
}
