import { NitroModules } from 'react-native-nitro-modules'
import type { Clipboard } from './specs/Clipboard.nitro'

const clipboard = NitroModules.createHybridObject<Clipboard>('Clipboard')

export default clipboard as Clipboard
