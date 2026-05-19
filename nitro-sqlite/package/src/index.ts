import { NitroModules } from 'react-native-nitro-modules'
import { type Sqlite, type TransactionQuery, type QueryResult, type Row, type RowValue } from './specs/Sqlite.nitro'

const sqlite = NitroModules.createHybridObject<Sqlite>('Sqlite')

export default sqlite as Sqlite

export type { Sqlite, TransactionQuery, QueryResult, Row, RowValue }
