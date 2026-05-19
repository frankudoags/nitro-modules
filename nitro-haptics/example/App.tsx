import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Haptics, HapticStyle } from 'nitro-haptics';

const HapticDemo = () => {
  const [feedback, setFeedback] = useState<string>('');

  const triggerHaptic = async (style: HapticStyle, description: string) => {
    try {
      Haptics.trigger(style);
      setFeedback(`Triggered: ${description}`);
    } catch (error) {
      console.error('Haptic error:', error);
      setFeedback('Error: Vibration may be disabled');
    }
  };

  const showConfirmation = () => {
    Alert.alert(
      'Haptics Demo',
      'This app demonstrates different haptic feedback patterns. Try each button to feel the different types of vibrations!',
      [{ text: 'Got it!' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Nitro Haptics Demo</Text>
          <Text style={styles.subtitle}>
            Experience different haptic feedback patterns
          </Text>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={showConfirmation}
          >
            <Text style={styles.infoButtonText}>ℹ️ Info</Text>
          </TouchableOpacity>
        </View>

        {feedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selection Haptics</Text>
          <Text style={styles.sectionDescription}>
            Light tap feedback for UI interactions
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.selectionButton]}
            onPress={() => triggerHaptic(HapticStyle.Selection, 'Selection')}
          >
            <Text style={styles.buttonText}>Try Selection</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Haptics</Text>
          <Text style={styles.sectionDescription}>
            Physical impact feedback - Light, Medium, Heavy
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.impactButton, styles.lightButton]}
            onPress={() => triggerHaptic(HapticStyle.ImpactLight, 'Light Impact')}
          >
            <Text style={styles.buttonText}>Light Impact</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.impactButton, styles.mediumButton]}
            onPress={() => triggerHaptic(HapticStyle.ImpactMedium, 'Medium Impact')}
          >
            <Text style={styles.buttonText}>Medium Impact</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.impactButton, styles.heavyButton]}
            onPress={() => triggerHaptic(HapticStyle.ImpactHeavy, 'Heavy Impact')}
          >
            <Text style={styles.buttonText}>Heavy Impact</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Haptics</Text>
          <Text style={styles.sectionDescription}>
            Alert feedback for different types of notifications
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.notificationButton, styles.successButton]}
            onPress={() => triggerHaptic(HapticStyle.NotificationSuccess, 'Success')}
          >
            <Text style={styles.buttonText}>✓ Success</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.notificationButton, styles.warningButton]}
            onPress={() => triggerHaptic(HapticStyle.NotificationWarning, 'Warning')}
          >
            <Text style={styles.buttonText}>⚠ Warning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.notificationButton, styles.errorButton]}
            onPress={() => triggerHaptic(HapticStyle.NotificationError, 'Error')}
          >
            <Text style={styles.buttonText}>✗ Error</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Demo</Text>
          <Text style={styles.sectionDescription}>
            Try all haptics in sequence
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.demoButton]}
            onPress={() => {
              const stylesList = [
                { style: HapticStyle.Selection, desc: 'Selection' },
                { style: HapticStyle.ImpactLight, desc: 'Light Impact' },
                { style: HapticStyle.ImpactMedium, desc: 'Medium Impact' },
                { style: HapticStyle.ImpactHeavy, desc: 'Heavy Impact' },
                { style: HapticStyle.NotificationSuccess, desc: 'Success' },
                { style: HapticStyle.NotificationWarning, desc: 'Warning' },
                { style: HapticStyle.NotificationError, desc: 'Error' },
              ];

              let currentIndex = 0;
              const interval = setInterval(() => {
                if (currentIndex < stylesList.length) {
                  triggerHaptic(stylesList[currentIndex].style, stylesList[currentIndex].desc);
                  currentIndex++;
                } else {
                  clearInterval(interval);
                  setFeedback('Demo complete!');
                }
              }, 500);
            }}
          >
            <Text style={styles.buttonText}>🎭 Run Demo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            • The nitro-haptics library provides hardware-accelerated haptic feedback
          </Text>
          <Text style={styles.infoText}>
            • Use {Platform.OS === 'ios' ? 'iOS' : 'Android'} native vibration engines
          </Text>
          <Text style={styles.infoText}>
            • All patterns work on both iOS and Android
          </Text>
          <Text style={styles.infoText}>
            • Perfect for UI feedback, notifications, and game interactions
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#86868b',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackContainer: {
    backgroundColor: '#34c759',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#86868b',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectionButton: {
    backgroundColor: '#007aff',
  },
  lightButton: {
    backgroundColor: '#34c759',
  },
  mediumButton: {
    backgroundColor: '#ff9500',
  },
  heavyButton: {
    backgroundColor: '#ff3b30',
  },
  notificationButton: {
    width: '100%',
  },
  successButton: {
    backgroundColor: '#34c759',
  },
  warningButton: {
    backgroundColor: '#ffcc00',
  },
  errorButton: {
    backgroundColor: '#ff3b30',
  },
  demoButton: {
    backgroundColor: '#af52de',
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#86868b',
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default HapticDemo;