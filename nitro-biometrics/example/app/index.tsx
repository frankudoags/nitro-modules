import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NitroBiometrics } from 'nitro-biometrics';
import type {
  BiometricsAvailability,
  BiometricsAuthResult,
  BiometricsKey,
  BiometricsSignature,
} from 'nitro-biometrics';

const BIOMETRY_TYPE_LABELS: Record<number, string> = {
  0: 'Face ID',
  1: 'Touch ID',
  2: 'Fingerprint',
  3: 'Face Unlock',
  4: 'Iris',
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ActionButton({
  title,
  onPress,
  loading,
  color = '#4f46e5',
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  color?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

function ResultBlock({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  if (value === null) return null;
  return (
    <View style={styles.resultBlock}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={[styles.resultValue, mono && styles.mono]}>{value}</Text>
    </View>
  );
}

function StatusBadge({ available }: { available: boolean }) {
  return (
    <View style={[styles.badge, available ? styles.badgeGreen : styles.badgeRed]}>
      <Text style={styles.badgeText}>{available ? 'Available' : 'Unavailable'}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [availability, setAvailability] = useState<BiometricsAvailability | null>(null);
  const [authResult, setAuthResult] = useState<BiometricsAuthResult | null>(null);
  const [keyResult, setKeyResult] = useState<BiometricsKey | null>(null);
  const [signatureResult, setSignatureResult] = useState<BiometricsSignature | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const checkWorks = useCallback(() => {
    try {
      const works = NitroBiometrics.works();
      Alert.alert('Works Check', works ? 'Biometrics module is working!' : 'Not working');
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? String(error));
    }
  }, []);

  const checkAvailability = useCallback(async () => {
    setLoading('availability');
    setAvailability(null);
    try {
      const result = NitroBiometrics.isAvailable();
      setAvailability(result);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? String(error));
    } finally {
      setLoading(null);
    }
  }, []);

  const authenticate = useCallback(async () => {
    setLoading('authenticate');
    setAuthResult(null);
    try {
      const result = await NitroBiometrics.authenticate('Verify your identity to continue');
      setAuthResult(result);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? String(error));
    } finally {
      setLoading(null);
    }
  }, []);

  const createKeys = useCallback(async () => {
    setLoading('createKeys');
    setKeyResult(null);
    try {
      const result = await NitroBiometrics.createKeys();
      setKeyResult(result);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? String(error));
    } finally {
      setLoading(null);
    }
  }, []);

  const signPayload = useCallback(async () => {
    setLoading('sign');
    setSignatureResult(null);
    try {
      const payload = JSON.stringify({
        timestamp: Date.now(),
        nonce: Math.random().toString(36).slice(2),
      });
      const result = await NitroBiometrics.signPayload(payload);
      setSignatureResult(result);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? String(error));
    } finally {
      setLoading(null);
    }
  }, []);

  const deleteKeys = useCallback(() => {
    try {
      NitroBiometrics.deleteKeys();
      setKeyResult(null);
      setSignatureResult(null);
      Alert.alert('Keys Deleted', 'Keypair has been removed.');
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? String(error));
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>NitroBiometrics</Text>
          <Text style={styles.headerSubtitle}>Biometric authentication demo</Text>
        </View>

        {/* Quick Check */}
        <SectionCard title="Module Check">
          <ActionButton
            title="Test works()"
            onPress={checkWorks}
            loading={loading === 'works'}
          />
        </SectionCard>

        {/* Availability */}
        <SectionCard title="Availability">
          <ActionButton
            title="Check Availability"
            onPress={checkAvailability}
            loading={loading === 'availability'}
          />
          {availability && (
            <View style={styles.resultContainer}>
              <StatusBadge available={availability.isAvailable} />
              {availability.biometryType !== null && (
                <ResultBlock
                  label="Biometry Type"
                  value={BIOMETRY_TYPE_LABELS[availability.biometryType] ?? `Unknown (${availability.biometryType})`}
                />
              )}
              {availability.error && (
                <ResultBlock label="Error" value={availability.error} />
              )}
            </View>
          )}
        </SectionCard>

        {/* Authenticate */}
        <SectionCard title="Authenticate">
          <ActionButton
            title="Authenticate"
            onPress={authenticate}
            loading={loading === 'authenticate'}
          />
          {authResult && (
            <View style={styles.resultContainer}>
              <StatusBadge available={authResult.success} />
              {authResult.error && (
                <ResultBlock label="Error" value={authResult.error} />
              )}
            </View>
          )}
        </SectionCard>

        {/* Key Management */}
        <SectionCard title="Key Management">
          <View style={styles.buttonRow}>
            <View style={styles.buttonRowItem}>
              <ActionButton
                title="Create Keys"
                onPress={createKeys}
                loading={loading === 'createKeys'}
                color="#059669"
              />
            </View>
            <View style={styles.buttonRowItem}>
              <ActionButton
                title="Delete Keys"
                onPress={deleteKeys}
                color="#dc2626"
              />
            </View>
          </View>
          {keyResult && (
            <View style={styles.resultContainer}>
              <ResultBlock label="Public Key (base64)" value={keyResult.publicKey} mono />
            </View>
          )}
        </SectionCard>

        {/* Sign Payload */}
        <SectionCard title="Sign Payload">
          <ActionButton
            title="Sign Random Payload"
            onPress={signPayload}
            loading={loading === 'sign'}
            color="#7c3aed"
          />
          {signatureResult && (
            <View style={styles.resultContainer}>
              <ResultBlock label="Signature (base64)" value={signatureResult.signature} mono />
            </View>
          )}
        </SectionCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonRowItem: {
    flex: 1,
  },
  resultContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeGreen: {
    backgroundColor: '#dcfce7',
  },
  badgeRed: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultBlock: {
    marginTop: 8,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 14,
    color: '#374151',
  },
  mono: {
    fontFamily: 'Menlo',
    fontSize: 11,
    lineHeight: 16,
    color: '#4b5563',
  },
  footer: {
    height: 40,
  },
});
