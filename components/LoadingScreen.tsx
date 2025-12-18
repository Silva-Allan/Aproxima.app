// src/components/LoadingScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import LoadingPuzzle from './Loading';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingScreen({ 
  message = "Montando seu mundo", 
  subMessage = "Preparando uma experiência incrível para você" 
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <LoadingPuzzle />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A8D8F0',
  },
});