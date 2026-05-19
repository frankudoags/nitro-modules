import { NitroModules } from 'react-native-nitro-modules'
import { HapticStyle, type Haptics } from './specs/Haptics.nitro'

const haptics = NitroModules.createHybridObject<Haptics>('Haptics')

export { haptics as Haptics, HapticStyle }
