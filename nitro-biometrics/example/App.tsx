import React, { use, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NitroBiometrics } from 'nitro-biometrics';

function App(): React.JSX.Element {

  useEffect(() => {
      try {
        const working = NitroBiometrics.works();
        console.log('Biometrics working:', working);
      } catch (error) {
        console.error('Error checking biometrics status:', error);
      }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello world</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    color: 'green',
  },
});

export default App;
