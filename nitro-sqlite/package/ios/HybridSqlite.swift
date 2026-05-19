import Foundation
import NitroModules
import SQLite3

private let SQLITE_TRANSIENT = unsafeBitCast(-1, to: sqlite3_destructor_type.self)

class HybridSqlite: HybridSqliteSpec {
    
    private var db: OpaquePointer? = nil
    
    func open(path: String) throws {
        if sqlite3_open(path, &db) != SQLITE_OK {
            throw NSError(domain: "HybridSqlite", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to open database"])
        }
    }
    
    func close() throws {
        if sqlite3_close(db) != SQLITE_OK {
            throw NSError(domain: "HybridSqlite", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed to close database"])
        }
        db = nil
    }
    
    func execute(query: String, params: [String]) throws -> QueryResult {
        // Prepare the SQL statement
        var stmt: OpaquePointer? = nil
        // Check if the statement was prepared successfully
        if sqlite3_prepare_v2(db, query, -1, &stmt, nil) != SQLITE_OK {
            throw NSError(domain: "HybridSqlite", code: 3, userInfo: [NSLocalizedDescriptionKey: "Failed to prepare statement"])
        }
        
        // Bind parameters to the statement
        for (index, param) in params.enumerated() {
            // Use SQLITE_TRANSIENT so SQLite copies Swift string bytes immediately.
            // Passing nil uses SQLITE_STATIC, which can leave SQLite with dangling pointers.
            sqlite3_bind_text(stmt, Int32(index + 1), param, -1, SQLITE_TRANSIENT)
        }

        // Execute the statement and collect results
        var rows: [Row] = []
        while sqlite3_step(stmt) == SQLITE_ROW {
            let columnCount = sqlite3_column_count(stmt)
            for i in 0..<columnCount {
                let columnName = String(cString: sqlite3_column_name(stmt, i))
                let rowValue: RowValue
                let columnType = sqlite3_column_type(stmt, i)
                switch columnType {
                case SQLITE_INTEGER, SQLITE_FLOAT:
                    let num = sqlite3_column_double(stmt, i)
                    rowValue = RowValue(
                        stringValue: .first(NullType.null),
                        numberValue: .second(num),
                        boolValue: .first(NullType.null)
                    )
                case SQLITE_TEXT:
                    let text = String(cString: sqlite3_column_text(stmt, i))
                    rowValue = RowValue(
                        stringValue: .second(text),
                        numberValue: .first(NullType.null),
                        boolValue: .first(NullType.null)
                    )
                case SQLITE_NULL:
                    rowValue = RowValue(
                        stringValue: .first(NullType.null),
                        numberValue: .first(NullType.null),
                        boolValue: .first(NullType.null)
                    )
                default:
                    rowValue = RowValue(
                        stringValue: .first(NullType.null),
                        numberValue: .first(NullType.null),
                        boolValue: .first(NullType.null)
                    )
                }
                
                // append the row to the results
                rows.append(Row(columnName: columnName, value: rowValue))
            }
        }

        // finish the statement
        sqlite3_finalize(stmt)

        // return the query result
        return QueryResult(
                rows: rows,
                rowsAffected: Double(sqlite3_changes(db)),
                insertId: Double(sqlite3_last_insert_rowid(db))
        
                )
    }

    func transaction(queries: [TransactionQuery]) throws -> [QueryResult] {
        var results: [QueryResult] = []
        do {
            try execute(query: "BEGIN", params: [])
            for query in queries {
                let result = try execute(query: query.query, params: query.params)
                results.append(result)
            }
            try execute(query: "COMMIT", params: [])
        } catch {
            try? execute(query: "ROLLBACK", params: [])
            throw error
        }

        return results
    }
}
