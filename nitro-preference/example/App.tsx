import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Preference } from "nitro-preferences";
import type { PreferenceEntry } from "nitro-preferences";

const FIXED_KEYS = {
  string: "my_key_string",
  number: "my_key_number",
  bool: "my_key_bool",
} as const;

type StoredValue = {
  id: string;
  key: string;
  type: "string" | "number" | "boolean";
  value: string | number | boolean;
};

type NormalizedPreferenceEntry = {
  key: string;
  stringValue: string | null;
  numberValue: number | null;
  boolValue: boolean | null;
};

const normalizeEntry = (entry: PreferenceEntry): NormalizedPreferenceEntry => ({
  key: entry.key,
  stringValue: entry.stringValue ?? null,
  numberValue: entry.numberValue ?? null,
  boolValue: entry.boolValue ?? null,
});

const toStoredValue = (entry: PreferenceEntry): StoredValue => {
  const normalized = normalizeEntry(entry);

  if (normalized.stringValue !== null) {
    return {
      id: normalized.key,
      key: normalized.key,
      type: "string",
      value: normalized.stringValue,
    };
  }
  if (normalized.numberValue !== null) {
    return {
      id: normalized.key,
      key: normalized.key,
      type: "number",
      value: normalized.numberValue,
    };
  }
  return {
    id: normalized.key,
    key: normalized.key,
    type: "boolean",
    value: normalized.boolValue === true,
  };
};

export default function App() {
  const [stringValue, setStringValue] = useState("hello world");
  const [numberValue, setNumberValue] = useState("42");
  const [boolValue, setBoolValue] = useState(true);
  const [storedValues, setStoredValues] = useState<StoredValue[]>([]);

  const handleSetString = async () => {
    try {
      await Preference.setString(FIXED_KEYS.string, stringValue);
      await loadValues();
      Alert.alert(
        "Success",
        `Set string: ${FIXED_KEYS.string} = ${stringValue}`,
      );
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleSetNumber = async () => {
    try {
      const num = parseFloat(numberValue);
      if (isNaN(num)) {
        Alert.alert("Error", "Invalid number");
        return;
      }
      await Preference.setNumber(FIXED_KEYS.number, num);
      await loadValues();
      Alert.alert("Success", `Set number: ${FIXED_KEYS.number} = ${num}`);
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleSetBool = async () => {
    try {
      await Preference.setBool(FIXED_KEYS.bool, boolValue);
      await loadValues();
      Alert.alert("Success", `Set bool: ${FIXED_KEYS.bool} = ${boolValue}`);
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleGetString = async () => {
    try {
      const value = await Preference.getString(FIXED_KEYS.string);
      await loadValues();
      Alert.alert(
        "Result",
        `String value for "${FIXED_KEYS.string}": ${value ?? "null"}`,
      );
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleGetNumber = async () => {
    try {
      const value = await Preference.getNumber(FIXED_KEYS.number);
      await loadValues();
      Alert.alert(
        "Result",
        `Number value for "${FIXED_KEYS.number}": ${value ?? "null"}`,
      );
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleGetBool = async () => {
    try {
      const value = await Preference.getBool(FIXED_KEYS.bool);
      await loadValues();
      Alert.alert(
        "Result",
        `Bool value for "${FIXED_KEYS.bool}": ${value ?? "null"}`,
      );
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleRemove = async () => {
    try {
      await Promise.all([
        Preference.remove(FIXED_KEYS.string),
        Preference.remove(FIXED_KEYS.number),
        Preference.remove(FIXED_KEYS.bool),
      ]);
      await loadValues();
      Alert.alert("Success", "Removed all fixed keys");
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleClear = async () => {
    try {
      await Preference.clear();
      await loadValues();
      Alert.alert("Success", "Cleared all preferences");
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const loadValues = async () => {
    try {
      const entries = await Preference.getAll();
      console.log("Loaded entries:", entries);
      const values: StoredValue[] = entries.map(toStoredValue);

      setStoredValues(values);
    } catch (error) {
      console.error("Failed to load values:", error);
    }
  };

  React.useEffect(() => {
    loadValues();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Nitro Preferences Demo</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            String Value ({FIXED_KEYS.string})
          </Text>
          <TextInput
            style={styles.input}
            value={stringValue}
            onChangeText={setStringValue}
            placeholder="Enter string value"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleSetString}>
              <Text style={styles.buttonText}>Set String</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleGetString}
            >
              <Text style={styles.buttonText}>Get String</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Number Value ({FIXED_KEYS.number})
          </Text>
          <TextInput
            style={styles.input}
            value={numberValue}
            onChangeText={setNumberValue}
            placeholder="Enter number"
            keyboardType="numeric"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleSetNumber}>
              <Text style={styles.buttonText}>Set Number</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleGetNumber}
            >
              <Text style={styles.buttonText}>Get Number</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Boolean Value ({FIXED_KEYS.bool}): {boolValue ? "true" : "false"}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleSetBool}>
              <Text style={styles.buttonText}>Set Bool</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleGetBool}
            >
              <Text style={styles.buttonText}>Get Bool</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.buttonTertiary]}
            onPress={() => setBoolValue(!boolValue)}
          >
            <Text style={styles.buttonText}>Toggle Bool Value</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={handleRemove}
            >
              <Text style={styles.buttonText}>Remove Fixed Keys</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={handleClear}
            >
              <Text style={styles.buttonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stored Values</Text>
          {storedValues.length === 0 ? (
            <Text style={styles.noData}>No values stored</Text>
          ) : (
            storedValues.map((item) => (
              <View key={item.id} style={styles.valueItem}>
                <Text style={styles.valueKey}>{item.key}</Text>
                <Text style={styles.valueType}>[{item.type}]</Text>
                <Text style={styles.valueValue}>{String(item.value)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#5856D6",
  },
  buttonTertiary: {
    backgroundColor: "#34C759",
    marginTop: 8,
  },
  buttonDanger: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  noData: {
    color: "#999",
    textAlign: "center",
    padding: 8,
  },
  valueItem: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  valueKey: {
    flex: 1,
    fontWeight: "500",
    color: "#333",
  },
  valueType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#E5E5EA",
    borderRadius: 4,
    fontSize: 12,
    color: "#666",
  },
  valueValue: {
    flex: 1,
    textAlign: "right",
    color: "#007AFF",
    fontFamily: "monospace",
  },
});
