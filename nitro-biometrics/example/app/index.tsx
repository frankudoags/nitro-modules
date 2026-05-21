import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NitroBiometrics } from 'nitro-biometrics';
import type {
  BiometricsAvailability,
  BiometricsAuthResult,
} from 'nitro-biometrics';

const BIOMETRY_LABELS: Record<number, string> = {
  0: 'Face ID',
  1: 'Touch ID',
  2: 'Fingerprint',
  3: 'Face Unlock',
  4: 'Iris',
};

function showEnrollmentAlert() {
  Alert.alert(
    'Not Enrolled',
    'No biometrics are enrolled. Go to Settings to set up Face ID, Touch ID, or a fingerprint.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ],
  );
}

export default function HomeScreen() {
  const [availability, setAvailability] = useState<BiometricsAvailability | null>(null);
  const [authResult, setAuthResult] = useState<BiometricsAuthResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const checkAvailability = useCallback(async () => {
    setLoading('availability');
    setAvailability(null);
    try {
      const result = await NitroBiometrics.getAvailability();
      setAvailability(result);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? String(error));
    } finally {
      setLoading(null);
    }
  }, []);

  const authenticate = useCallback(async () => {
    setLoading('auth');
    setAuthResult(null);
    try {
      const avail = await NitroBiometrics.getAvailability();
      if (!avail.available) {
        Alert.alert('Not Available', 'Biometrics are not available on this device.');
        return;
      }
      if (!avail.isEnrolled) {
        showEnrollmentAlert();
        return;
      }
      const result = await NitroBiometrics.authenticate('Verify your identity');
      setAuthResult(result);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? String(error));
    } finally {
      setLoading(null);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="shield-checkmark" size={36} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>NitroBiometrics</Text>
          <Text style={styles.heroSubtitle}>
            Secure biometric authentication for React Native, powered by Nitro Modules
          </Text>
        </View>

        {/* Availability */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardDot, { backgroundColor: '#4f46e5' }]} />
            <Text style={styles.cardLabel}>AVAILABILITY</Text>
          </View>
          <Text style={styles.cardDesc}>
            Check if this device supports biometric authentication.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={checkAvailability}
            disabled={loading === 'availability'}
            activeOpacity={0.7}
          >
            {loading === 'availability' ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="scan-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>Check Availability</Text>
              </>
            )}
          </TouchableOpacity>
          {availability && (
            <View style={styles.results}>
              <View style={[styles.badge, availability.available ? styles.badgeGreen : styles.badgeRed]}>
                <Text style={[styles.badgeText, availability.available ? styles.badgeTextGreen : styles.badgeTextRed]}>
                  {availability.available ? 'Available' : 'Unavailable'}
                </Text>
              </View>
              {availability.supportedBiometryTypes.filter((t): t is number => t !== null).length > 0 && (
                <View style={styles.resultRow}>
                  <Ionicons name="hardware-chip-outline" size={14} color="#9ca3af" />
                  <Text style={styles.resultText}>
                    {availability.supportedBiometryTypes
                      .filter((t): t is number => t !== null)
                      .map(t => BIOMETRY_LABELS[t])
                      .join(', ')}
                  </Text>
                </View>
              )}
              <View style={styles.resultRow}>
                <Ionicons name="key-outline" size={14} color="#9ca3af" />
                <Text style={styles.resultText}>
                  Enrolled: {availability.isEnrolled ? 'Yes' : 'No'}
                </Text>
              </View>
              {availability.unavailableReason && (
                <View style={styles.resultRow}>
                  <Ionicons name="alert-circle-outline" size={14} color='#dc2626' />
                  <Text style={[styles.resultText, { color: '#dc2626' }]}>
                    {availability.unavailableReason}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Try It */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardDot, { backgroundColor: '#7c3aed' }]} />
            <Text style={styles.cardLabel}>AUTHENTICATION</Text>
          </View>
          <Text style={styles.cardDesc}>
            Test the biometric prompt and see the system authentication dialog.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={authenticate}
            disabled={loading === 'auth'}
            activeOpacity={0.7}
          >
            {loading === 'auth' ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="finger-print-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>Authenticate</Text>
              </>
            )}
          </TouchableOpacity>
          {authResult && (
            <View style={styles.results}>
              <View style={[styles.badge, authResult.success ? styles.badgeGreen : styles.badgeRed]}>
                <Text style={[styles.badgeText, authResult.success ? styles.badgeTextGreen : styles.badgeTextRed]}>
                  {authResult.success ? 'Success' : 'Failed'}
                </Text>
              </View>
              {authResult.error && (
                <View style={styles.resultRow}>
                  <Ionicons name="close-circle-outline" size={14} color="#dc2626" />
                  <Text style={[styles.resultText, { color: '#dc2626' }]}>{authResult.error}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },

  // ── Hero ────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: '#4f46e5',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  // ── Cards ───────────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },

  // ── Buttons ─────────────────────────────────────────────────
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: '#4f46e5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Results ─────────────────────────────────────────────────
  results: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  badgeGreen: { backgroundColor: '#dcfce7' },
  badgeRed: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 13, fontWeight: '600' },
  badgeTextGreen: { color: '#166534' },
  badgeTextRed: { color: '#991b1b' },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#374151',
  },

  // ── Steps ───────────────────────────────────────────────────
  steps: {
    gap: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 0,
  },
  stepTimeline: {
    width: 24,
    alignItems: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: '#e5e7eb',
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  stepDesc: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },

  // ── CTA ─────────────────────────────────────────────────────
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#eef2ff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  ctaText: {
    flex: 1,
    fontSize: 14,
    color: '#4f46e5',
    lineHeight: 20,
  },
  ctaBold: {
    fontWeight: '700',
  },
});
