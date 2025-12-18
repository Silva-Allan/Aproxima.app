import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { ThumbsUp, ThumbsDown, Home, ArrowLeft } from 'lucide-react-native';

const Choices = () => {
  const navigation = useNavigation();
  const [yesScale] = useState(new Animated.Value(1));
  const [noScale] = useState(new Animated.Value(1));
  const [isSpeaking, setIsSpeaking] = useState(false);

  const animateButton = (buttonScale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleChoice = async (choice: string) => {
    if (isSpeaking) return;

    const buttonScale = choice === 'Sim' ? yesScale : noScale;
    animateButton(buttonScale);

    try {
      setIsSpeaking(true);
      await Speech.speak(choice, {
        language: 'pt-BR',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Erro ao falar texto:', error);
      setIsSpeaking(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  };

  return (
    <View style={styles.container}>
      {/* Header com título */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Escolhas</Text>
          <Text style={styles.subtitle}>Toque para escolher</Text>
        </View>
      </View>

      {/* Grid de escolhas */}
      <View style={styles.grid}>
        {/* Sim - Verde */}
        <Animated.View style={{ flex: 1, transform: [{ scale: yesScale }] }}>
          <TouchableOpacity
            onPress={() => handleChoice("Sim")}
            style={[styles.choiceButton, styles.yesButton]}
            activeOpacity={0.9}
            accessibilityLabel="Sim"
            disabled={isSpeaking}
          >
            <View style={styles.buttonContent}>
              <ThumbsUp size={120} color="white" strokeWidth={3} />
              <Text style={styles.choiceLabel}>SIM</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Não - Vermelho */}
        <Animated.View style={{ flex: 1, transform: [{ scale: noScale }] }}>
          <TouchableOpacity
            onPress={() => handleChoice("Não")}
            style={[styles.choiceButton, styles.noButton]}
            activeOpacity={0.9}
            accessibilityLabel="Não"
            disabled={isSpeaking}
          >
            <View style={styles.buttonContent}>
              <ThumbsDown size={120} color="white" strokeWidth={3} />
              <Text style={styles.choiceLabel}>NÃO</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Navegação inferior */}
      <View style={styles.bottomNav}>
        <View style={styles.navContent}>
          <TouchableOpacity
            onPress={handleHome}
            style={styles.navButton}
            activeOpacity={0.7}
            accessibilityLabel="Home"
          >
            <Home size={32} color="white" strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBack}
            style={styles.navButton}
            activeOpacity={0.7}
            accessibilityLabel="Voltar"
          >
            <ArrowLeft size={32} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A8D8F0',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 16
    
  },
  headerContent: {
    maxWidth: 400,
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#8BC5E5',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
  },
  choiceButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#A8E6B0',
  },
  noButton: {
    backgroundColor: '#F5A4A4',
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  choiceLabel: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#A8D8F0',
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    maxWidth: 400,
    marginHorizontal: 'auto',
    gap: 24,
  },
  navButton: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default Choices;