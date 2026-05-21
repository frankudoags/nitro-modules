import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NitroBiometrics } from 'nitro-biometrics';
import { useFocusEffect } from 'expo-router';

export default function ProfileScreen() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalUnlocked, setModalUnlocked] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Re-lock profile when leaving the tab
  useFocusEffect(
    useCallback(() => {
      setIsUnlocked(false);
    }, [])
  );

  const unlockProfile = useCallback(async () => {
    setUnlocking(true);
    try {
      const avail = await NitroBiometrics.getAvailability();
      if (!avail.available) {
        Alert.alert('Not Available', 'Biometrics are not available on this device.');
        return;
      }
      if (!avail.isEnrolled) {
        Alert.alert(
          'Not Enrolled',
          'No biometrics are enrolled. Go to Settings to set up Face ID, Touch ID, or a fingerprint.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      const result = await NitroBiometrics.authenticate('Unlock your profile');
      if (result.success) {
        setIsUnlocked(true);
      } else {
        Alert.alert('Authentication Failed', result.error ?? 'Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? String(error));
    } finally {
      setUnlocking(false);
    }
  }, []);

  const openSecureNote = useCallback(() => {
    setModalUnlocked(false);
    setShowModal(true);
  }, []);

  const unlockNote = useCallback(async () => {
    setModalLoading(true);
    try {
      const avail = await NitroBiometrics.getAvailability();
      if (!avail.available) {
        Alert.alert('Not Available', 'Biometrics are not available on this device.');
        return;
      }
      if (!avail.isEnrolled) {
        Alert.alert(
          'Not Enrolled',
          'No biometrics are enrolled. Go to Settings to set up Face ID, Touch ID, or a fingerprint.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      const result = await NitroBiometrics.authenticate('View your secure note');
      if (result.success) {
        setModalUnlocked(true);
      } else {
        Alert.alert('Authentication Failed', result.error ?? 'Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? String(error));
    } finally {
      setModalLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalUnlocked(false);
  }, []);

  // ── Locked overlay ──────────────────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.lockScreen}>
          <View style={styles.lockCircle}>
            <Ionicons name="lock-closed" size={32} color="#4f46e5" />
          </View>
          <Text style={styles.lockTitle}>Profile Locked</Text>
          <Text style={styles.lockSubtitle}>
            Authenticate with biometrics to view your profile
          </Text>
          <TouchableOpacity
            style={[styles.unlockBtn, unlocking && styles.unlockBtnDisabled]}
            onPress={unlockProfile}
            disabled={unlocking}
            activeOpacity={0.7}
          >
            {unlocking ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="finger-print" size={20} color="#fff" />
                <Text style={styles.unlockBtnText}>Unlock</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Unlocked profile ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => setIsUnlocked(false)}>
            <Ionicons name="lock-open" size={22} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* User card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>Jane Doe</Text>
              <Text style={styles.userEmail}>jane.doe@email.com</Text>
            </View>
          </View>
        </View>

        {/* Account details */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ACCOUNT</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Member since</Text>
            <Text style={styles.detailValue}>Jan 2024</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plan</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Region</Text>
            <Text style={styles.detailValue}>United States</Text>
          </View>
        </View>

        {/* Secure notes */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>SECURE NOTES</Text>
          <Text style={styles.cardDesc}>
            Your encrypted notes require biometric verification to view.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#7c3aed' }]}
            onPress={openSecureNote}
            activeOpacity={0.7}
          >
            <Ionicons name="document-lock" size={18} color="#fff" />
            <Text style={styles.buttonText}>View Secret Note</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Secure Note Modal ──────────────────────────────────────────────── */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalRoot}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>
              {modalUnlocked ? 'Secret Note' : 'Secure Note'}
            </Text>
            <Pressable onPress={closeModal} hitSlop={16}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </Pressable>
          </View>

          {modalUnlocked ? (
            // ── Decrypted note ──
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.noteCard}>
                <View style={styles.noteIcon}>
                  <Ionicons name="document-text" size={24} color="#7c3aed" />
                </View>
                <Text style={styles.noteTitle}>Personal Note</Text>
                <Text style={styles.noteBody}>
                  This is a secret note that required biometric authentication to
                  view. In a real app, this could contain sensitive data like
                  passwords, financial information, or private messages.
                </Text>
                <View style={styles.noteMetaRow}>
                  <Ionicons name="time-outline" size={14} color="#9ca3af" />
                  <Text style={styles.noteMeta}>Last modified: Today at 2:30 PM</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#dc2626', marginTop: 16 }]}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            // ── Locked modal ──
            <View style={styles.modalLockContainer}>
              <View style={styles.lockCircle}>
                <Ionicons name="document-lock" size={32} color="#7c3aed" />
              </View>
              <Text style={styles.lockTitle}>Note Locked</Text>
              <Text style={styles.lockSubtitle}>
                Authenticate to decrypt this note
              </Text>
              <TouchableOpacity
                style={[styles.unlockBtn, { backgroundColor: '#7c3aed' }, modalLoading && styles.unlockBtnDisabled]}
                onPress={unlockNote}
                disabled={modalLoading}
                activeOpacity={0.7}
              >
                {modalLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="finger-print" size={20} color="#fff" />
                    <Text style={styles.unlockBtnText}>Unlock Note</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // ── Lock screen ──────────────────────────────────────────────
  lockScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  lockCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lockTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  lockSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minHeight: 50,
  },
  unlockBtnDisabled: {
    opacity: 0.6,
  },
  unlockBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // ── Profile content ──────────────────────────────────────────
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: -0.5,
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
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  cardDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 14,
    lineHeight: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a2e',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 8,
  },
  premiumBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    minHeight: 48,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Modal ────────────────────────────────────────────────────
  modalRoot: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 8,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  modalLockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  noteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  noteTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 10,
  },
  noteBody: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  noteMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteMeta: {
    fontSize: 13,
    color: '#9ca3af',
  },
});
