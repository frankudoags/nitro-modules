import type { HybridObject } from 'react-native-nitro-modules'

export type StringValue = string | null
export type NumberValue = number | null
export type BoolValue = boolean | null

export interface RowValue {
  stringValue: StringValue
  numberValue: NumberValue  
  boolValue: BoolValue
}

export interface Row {
  columnName: string
  value: RowValue
}

export interface QueryResult {
  rows: Row[]
  rowsAffected: number
  insertId?: number
}

export interface TransactionQuery {
  query: string
  params: string[]
}

export interface Sqlite extends HybridObject<{
  ios: 'swift'
  android: 'kotlin'
}> {
  open(path: string): void
  close(): void
  execute(query: string, params: string[]): QueryResult
  transaction(queries: TransactionQuery[]): QueryResult[]
}
