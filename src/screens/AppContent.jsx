import { Button, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AppContent = () => {
  const safeAreaInsets = useSafeAreaInsets();
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={[styles.Heading, { paddingTop: safeAreaInsets.top }]}>
        Hello, JSX!
      </Text>
    </View>
  );
};

export default AppContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Heading: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
