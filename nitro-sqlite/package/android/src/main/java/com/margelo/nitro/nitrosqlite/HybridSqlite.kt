package com.margelo.nitro.nitropreferences

import com.margelo.nitro.core.NullType
import com.margelo.nitro.NitroModules
import com.margelo.nitro.nitrosqlite.HybridSqliteSpec
import com.margelo.nitro.nitrosqlite.QueryResult
import com.margelo.nitro.nitrosqlite.TransactionQuery
import android.database.sqlite.SQLiteDatabase
import android.content.ContentValues


class HybridSqlite : HybridSqliteSpec() {
    private var db: SQLiteDatabase? = null

    override fun open(path: String) {
        db = SQLiteDatabase.openOrCreateDatabase(path, null)
    }

    override fun close() {
        db?.close()
        db = null
    }

    override fun execute(
        query: String,
        params: Array<String>
    ): QueryResult {
        TODO("Not yet implemented")
    }

    override fun transaction(queries: Array<TransactionQuery>): Array<QueryResult> {
        TODO("Not yet implemented")
    }

}