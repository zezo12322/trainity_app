import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// نسخة مبسطة للاختبار - بدون أي تبعيات معقدة
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏴‍☠️ صناع الحياة القراصنة</Text>
      <Text style={styles.subtitle}>النسخة التجريبية</Text>
      <Text style={styles.version}>الإصدار: 1.0.0-demo</Text>
      <Text style={styles.status}>✅ التطبيق يعمل بنجاح!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 20,
  },
  version: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30,
  },
  status: {
    fontSize: 16,
    color: '#10B981',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
