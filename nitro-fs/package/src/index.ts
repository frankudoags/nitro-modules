import { NitroModules } from 'react-native-nitro-modules'
import type { Fs } from './specs/Fs.nitro'

const fs = NitroModules.createHybridObject<Fs>('Fs')

export default fs as Fs
