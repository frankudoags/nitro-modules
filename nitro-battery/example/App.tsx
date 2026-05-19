import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import battery, {
  type BatteryInfo,
  type BatteryStateResult,
} from "nitro-battery";

const STATE_COLORS: Record<BatteryStateResult, string> = {
  unknown: "#8E9AAF",
  unplugged: "#F3A712",
  charging: "#32C766",
  full: "#23A561",
};

const STATE_BG_COLORS: Record<BatteryStateResult, string> = {
  unknown: "#2B303B",
  unplugged: "#3B2F1E",
  charging: "#173A28",
  full: "#123626",
};

const STATE_LABELS: Record<BatteryStateResult, string> = {
  unknown: "Unknown",
  unplugged: "On Battery",
  charging: "Charging",
  full: "Fully Charged",
};

const gaugeHeight = (level: number | null) => {
  if (level == null) return "8%";
  const pct = level > 1 ? level : level * 100;
  return `${Math.max(8, Math.min(pct, 100))}%`;
};

export default function App() {
  const [info, setInfo] = useState<BatteryInfo>({
    level: null,
    state: "unknown",
  });
  const [updatedAt, setUpdatedAt] = useState("Never");

  const refresh = () => {
    setInfo(battery.getBatteryInfo());
    setUpdatedAt(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    refresh();
    const id = battery.subscribe((i) => {
      setInfo(i);
      setUpdatedAt(new Date().toLocaleTimeString());
    });
    return () => battery.unsubscribe(id);
  }, []);

  const color = STATE_COLORS[info.state];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.screen}>
        <Text style={styles.kicker}>nitro-battery</Text>
        <Text style={styles.title}>
          {info.level != null ? `${info.level}%` : "--%"}
        </Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View>
              <Text style={styles.levelValue}>
                {info.level != null ? info.level.toFixed(2) : "—"}
              </Text>
              <Text style={styles.levelHint}>Raw battery level</Text>
            </View>
            <View
              style={[
                styles.statePill,
                {
                  backgroundColor: STATE_BG_COLORS[info.state],
                  borderColor: color,
                },
              ]}
            >
              <Text style={[styles.statePillText, { color }]}>
                {STATE_LABELS[info.state]}
              </Text>
            </View>
          </View>

          <View style={styles.gaugeWrapper}>
            <View style={styles.terminalHead} />
            <View style={[styles.gaugeBody, { borderColor: color }]}>
              <View style={styles.gaugeInner}>
                <View
                  style={[
                    styles.gaugeFill,
                    { backgroundColor: color, height: gaugeHeight(info.level) },
                  ]}
                />
                {info.state === "charging" && (
                  <View style={styles.chargingBoltWrap}>
                    <Text style={styles.chargingBolt}>CHG</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Last update</Text>
            <Text style={styles.metaValue}>{updatedAt}</Text>
          </View>

          <Pressable style={styles.refreshButton} onPress={refresh}>
            <Text style={styles.refreshText}>Refresh Snapshot</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0C131F",
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: "center",
  },
  kicker: {
    color: "#6DA0D8",
    letterSpacing: 1.1,
    fontSize: 13,
    marginBottom: 6,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  title: {
    color: "#EAF2FF",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 18,
  },
  card: {
    borderRadius: 22,
    backgroundColor: "rgba(15, 23, 35, 0.86)",
    borderWidth: 1,
    borderColor: "#263246",
    padding: 18,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  levelValue: {
    color: "#F4F8FF",
    fontSize: 44,
    fontWeight: "800",
  },
  levelHint: {
    color: "#95A4BC",
    fontSize: 13,
    marginTop: -4,
  },
  statePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  statePillText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  gaugeWrapper: {
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 246,
  },
  terminalHead: {
    width: 56,
    height: 14,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: "#2A374D",
    marginBottom: 6,
  },
  gaugeBody: {
    width: 140,
    height: 214,
    borderRadius: 20,
    borderWidth: 4,
    padding: 8,
    backgroundColor: "#0D1522",
  },
  gaugeInner: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#141F33",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  gaugeFill: {
    width: "100%",
    borderRadius: 8,
  },
  chargingBoltWrap: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  chargingBolt: {
    fontSize: 44,
    color: "#F5FF7D",
    textShadowColor: "#F5FF7D",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaLabel: {
    color: "#8A9AB4",
    fontSize: 13,
  },
  metaValue: {
    color: "#D5DFEF",
    fontSize: 13,
    fontWeight: "700",
  },
  refreshButton: {
    marginTop: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2F72C4",
    backgroundColor: "#1A4E8A",
    paddingVertical: 12,
    alignItems: "center",
  },
  refreshText: {
    color: "#EAF3FF",
    fontWeight: "700",
    fontSize: 14,
  },
});
