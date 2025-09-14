import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AgentProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Agent Profile Screen</Text>
      <Text style={styles.subtext}>Agent details coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});
