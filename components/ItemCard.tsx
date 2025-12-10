// src/components/ItemCard.tsx - ATUALIZADO
import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';

interface ItemCardProps {
  icon?: React.ComponentType<any>;
  label: string;
  onSelect: () => void;
  imagemUrl?: string;
}

const ItemCard = ({ icon: Icon, label, onSelect, imagemUrl }: ItemCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (imagemUrl) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [imagemUrl]);

  const handlePress = async () => {
    try {
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
  const cardSize = (screenWidth - 48) / 2;

  // Limpar e validar a URL da imagem
  const getCleanImageUrl = () => {
    if (!imagemUrl) return null;
    
    // Remover parâmetros de timestamp que podem causar problemas
    let cleanUrl = imagemUrl.split('?')[0];
    
    // Garantir que a URL comece com https://
    if (cleanUrl.startsWith('http://')) {
      cleanUrl = cleanUrl.replace('http://', 'https://');
    }
    
    // Adicionar timestamp para evitar cache
    const timestamp = Date.now();
    return `${cleanUrl}?t=${timestamp}`;
  };

  const cleanImageUrl = getCleanImageUrl();
  const hasValidImage = cleanImageUrl && cleanImageUrl.startsWith('https://');

  const isNativeGesto = !!Icon && !hasValidImage;
  const isCustomGesto = hasValidImage;

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
        {/* ÁREA DA IMAGEM/ÍCONE */}
        <View style={styles.imageIconContainer}>
          {isCustomGesto && cleanImageUrl ? (
            // GESTO PERSONALIZADO: Mostrar imagem
            <>
              {imageLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
              
              <Image
                source={{ 
                  uri: cleanImageUrl,
                  cache: 'reload' // Força recarregamento
                }}
                style={[
                  styles.image,
                  { opacity: imageLoading ? 0 : 1 }
                ]}
                onLoadStart={() => {
                  console.log('⏳ Carregando imagem:', cleanImageUrl);
                  setImageLoading(true);
                }}
                onLoad={() => {
                  console.log('✅ Imagem carregada com sucesso');
                  setImageLoading(false);
                  setImageError(false);
                }}
                onError={(error) => {
                  console.error('❌ Erro ao carregar imagem:', error.nativeEvent.error);
                  console.log('URL falhou:', cleanImageUrl);
                  setImageLoading(false);
                  setImageError(true);
                }}
                resizeMode="contain"
                fadeDuration={0}
              />
              
              {imageError && (
                <View style={styles.errorContainer}>
                  {Icon ? (
                    <Icon size={56} color="white" strokeWidth={2.5} />
                  ) : (
                    <Text style={styles.errorText}>!</Text>
                  )}
                </View>
              )}
            </>
          ) : (
            // GESTO NATIVO: Mostrar ícone
            <>
              {Icon ? (
                <Icon size={56} color="white" strokeWidth={2.5} />
              ) : (
                <View style={styles.defaultIcon}>
                  <Text style={styles.defaultIconText}>
                    {label.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
        
        {/* LABEL DO GESTO */}
        <Text style={styles.label} numberOfLines={2}>
          {label.toUpperCase()}
        </Text>
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
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    width: '100%',
    height: '100%',
  },
  imageIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 10,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  defaultIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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
    minHeight: 40,
    maxWidth: '100%',
    paddingHorizontal: 8,
  },
});

export default ItemCard;