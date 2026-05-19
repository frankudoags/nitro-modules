package com.margelo.nitro.nitropreferences

import com.margelo.nitro.core.Promise
import com.margelo.nitro.core.NullType
import com.margelo.nitro.NitroModules
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.doublePreferencesKey
import androidx.datastore.preferences.core.booleanPreferencesKey
import kotlinx.coroutines.flow.first
import okio.Path.Companion.toPath

internal const val PREFERENCE_FILE_NAME = "nitro_preferences.preferences_pb"

class HybridPreference : HybridPreferenceSpec() {
    override fun getString(key: String): Promise<StringOutput> {
        return Promise.async {
            val prefKey = stringPreferencesKey(key)
            val preferences = dataStore.data.first()
            val value = try {
                preferences[prefKey]
            } catch (_: ClassCastException) {
                null
            }
            if (value != null) StringOutput.create(value) else StringOutput.create(NullType.NULL)
        }
    }

    override fun setString(key: String, value: String): Promise<Unit> {
        return Promise.async {
            dataStore.edit { preferences ->
                preferences[stringPreferencesKey(key)] = value
            }
        }
    }

    override fun getNumber(key: String): Promise<NumberOutput> {
        return Promise.async {
            val prefKey = doublePreferencesKey(key)
            val preferences = dataStore.data.first()
            val value = try {
                preferences[prefKey]
            } catch (_: ClassCastException) {
                null
            }
            if (value != null) NumberOutput.create(value) else NumberOutput.create(NullType.NULL)
        }
    }

    override fun setNumber(key: String, value: Double): Promise<Unit> {
        return Promise.async {
            dataStore.edit { preferences ->
                preferences[doublePreferencesKey(key)] = value
            }
        }
    }

    override fun getBool(key: String): Promise<BoolOutput> {
        return Promise.async {
            val prefKey = booleanPreferencesKey(key)
            val preferences = dataStore.data.first()
            val value = try {
                preferences[prefKey]
            } catch (_: ClassCastException) {
                null
            }
            if (value != null) BoolOutput.create(value) else BoolOutput.create(NullType.NULL)
        }
    }

    override fun setBool(key: String, value: Boolean): Promise<Unit> {
        return Promise.async {
            dataStore.edit { preferences ->
                preferences[booleanPreferencesKey(key)] = value
            }
        }
    }

    override fun remove(key: String): Promise<Unit> {
        return Promise.async {
            dataStore.edit { preferences ->
                // Since we don't know the type of the key, we try to remove it from all possible preference types
                preferences.remove(stringPreferencesKey(key))
                preferences.remove(doublePreferencesKey(key))
                preferences.remove(booleanPreferencesKey(key))
            }
        }
    }

    override fun getAll(): Promise<Array<PreferenceEntry>> {
        return Promise.async {
            val preferences = dataStore.data.first()
            preferences.asMap().map { (prefKey, value) ->
                when (value) {
                    is String -> PreferenceEntry(
                        prefKey.name,
                        StringOutput.create(value),
                        NumberOutput.create(NullType.NULL),
                        BoolOutput.create(NullType.NULL)
                    )

                    is Double -> PreferenceEntry(
                        prefKey.name,
                        StringOutput.create(NullType.NULL),
                        NumberOutput.create(value),
                        BoolOutput.create(NullType.NULL)
                    )

                    is Boolean -> PreferenceEntry(
                        prefKey.name,
                        StringOutput.create(NullType.NULL),
                        NumberOutput.create(NullType.NULL),
                        BoolOutput.create(value)
                    )

                    else -> null
                }

            }
                .filterNotNull()
                .sortedBy { it.key }
                .toTypedArray()
        }
    }

    override fun clear(): Promise<Unit> {
        return Promise.async {
            dataStore.edit { preferences ->
                preferences.clear()
            }
        }
    }

    companion object {
        private val context =
            NitroModules.applicationContext ?: error("React native context not found")
        private val dataStore = PreferenceDataStoreFactory.createWithPath(
            produceFile = { context.filesDir.resolve(PREFERENCE_FILE_NAME).absolutePath.toPath() }
        )
    }
}
