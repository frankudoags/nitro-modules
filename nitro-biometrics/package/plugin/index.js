import configPlugins from '@expo/config-plugins'
import { createRequire } from 'node:module'

const { withInfoPlist, createRunOncePlugin, IOSConfig, AndroidConfig } = configPlugins

const require = createRequire(import.meta.url)
const pkg = require('../package.json')
const FACE_ID_USAGE = 'Allow $(PRODUCT_NAME) to use Face ID'


const withNitroBiometrics = (config, options) => {
   IOSConfig.Permissions.createPermissionsPlugin({
    NSFaceIDUsageDescription: FACE_ID_USAGE,
  })(config, {
    NSFaceIDUsageDescription: options.faceIdUsageDescription || FACE_ID_USAGE,
  });

  return AndroidConfig.Permissions.withPermissions(config, [
    'android.permission.USE_BIOMETRIC',
    'android.permission.USE_FINGERPRINT',
  ]);
}

export default createRunOncePlugin(withNitroBiometrics, pkg.name, pkg.version)
