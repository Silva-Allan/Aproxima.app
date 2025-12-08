// components/ItemCard.tsx
import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import * as Speech from 'expo-speech';

// Use qualquer tipo que representa um componente React
interface ItemCardProps {
  icon: React.ComponentType<any>;
  label: string;
  onSelect: () => void;
}

/**
 * Card de item - Estilo Figma
 * Card azul claro com ícone branco e texto preto
 */
const ItemCard = ({ icon: Icon, label, onSelect }: ItemCardProps) => {
  const handlePress = async () => {
    try {
      // Text-to-Speech com Expo Speech
      Speech.speak(label, {
        language: 'pt-BR',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      console.error('Erro ao falar texto:', error);
    }
    
    onSelect();
  };

  const screenWidth = Dimensions.get('window').width;
  const cardSize = (screenWidth - 48) / 2; // 24px padding de cada lado

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        { 
          width: cardSize, 
          height: cardSize,
          backgroundColor: '#8BC5E5' 
        }
      ]}
      activeOpacity={0.7}
      accessibilityLabel={label}
    >
      <View style={styles.content}>
        <Icon size={56} color="white" strokeWidth={2.5} />
        <Text style={styles.label}>{label.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
    }),
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
  },
});

export default ItemCard;