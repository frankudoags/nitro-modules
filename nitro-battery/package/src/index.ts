import { NitroModules } from 'react-native-nitro-modules'
import type { Battery } from './specs/Battery.nitro'
export type {
	BatterInfoCallback,
	Battery,
	BatteryInfo,
	BatteryLevelResult,
	BatteryStateResult,
} from './specs/Battery.nitro'

const battery = NitroModules.createHybridObject<Battery>('Battery')

export default battery as Battery
