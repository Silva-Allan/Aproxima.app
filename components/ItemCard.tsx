// src/components/ItemCard.tsx - VERSÃO AJUSTADA
import React, { useState, useEffect, useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';
import * as LucideIcons from 'lucide-react-native';

type LucideIconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

interface ItemCardProps {
  icon?: LucideIconComponent;
  label: string;
  onSelect: () => void;
  imagemUrl?: string;
  size?: 'small' | 'medium' | 'large';
}

const ItemCard = ({ 
  icon: Icon, 
  label, 
  onSelect, 
  imagemUrl, 
  size = 'medium' 
}: ItemCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Tamanhos dinâmicos baseados no tamanho da tela
  const getCardDimensions = () => {
    const isLandscape = screenWidth > screenHeight;
    
    switch (size) {
      case 'small':
        return {
          cardSize: (screenWidth - 48) / 4, // 4 colunas
          iconSize: 36,
          labelFontSize: 10,
          imageContainerSize: 60,
        };
      case 'large':
        return {
          cardSize: (screenWidth - 32), // Largura total menos padding
          iconSize: 72,
          labelFontSize: 18,
          imageContainerSize: 140,
        };
      case 'medium':
      default:
        return isLandscape 
          ? {
              cardSize: (screenWidth - 64) / 4, // 4 colunas em landscape
              iconSize: 48,
              labelFontSize: 12,
              imageContainerSize: 80,
            }
          : {
              cardSize: (screenWidth - 48) / 2, // 2 colunas em portrait
              iconSize: 56,
              labelFontSize: 14,
              imageContainerSize: 100,
            };
    }
  };

  const dimensions = getCardDimensions();
  const cardSize = dimensions.cardSize;
  const iconSize = dimensions.iconSize;
  const labelFontSize = dimensions.labelFontSize;
  const imageContainerSize = dimensions.imageContainerSize;

  const handlePress = () => {
    Speech.speak(label, {
      language: 'pt-BR',
      pitch: 1.0,
      rate: 0.9,
    });
    onSelect();
  };

  const getContentType = () => {
    if (!imagemUrl) return 'icon';
    if (imagemUrl.startsWith('icon://')) return 'lucide-icon';
    if (
      imagemUrl.startsWith('http') ||
      imagemUrl.startsWith('file://') ||
      imagemUrl.startsWith('content://') ||
      imagemUrl.startsWith('data:')
    ) {
      return 'image';
    }
    return 'icon';
  };

  const contentType = getContentType();

  const cleanImageUrl = useMemo(() => {
    if (contentType !== 'image' || !imagemUrl) return null;

    let url = imagemUrl.split('?')[0];

    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }

    return url;
  }, [imagemUrl, contentType]);

  useEffect(() => {
    if (contentType === 'image') {
      setImageLoading(true);
      setImageError(false);
    }
  }, [cleanImageUrl, contentType]);

  const getLucideIcon = (name: string): LucideIconComponent => {
    const icons: Record<string, LucideIconComponent> = {
      Smile: LucideIcons.Smile,
      Heart: LucideIcons.Heart,
      Hand: LucideIcons.Hand,
      Bird: LucideIcons.Bird,
      Cat: LucideIcons.Cat,
      Dog: LucideIcons.Dog,
      Frown: LucideIcons.Frown,
      Laugh: LucideIcons.Laugh,
      Angry: LucideIcons.Angry,
      Meh: LucideIcons.Meh,
      ThumbsUp: LucideIcons.ThumbsUp,
      Eye: LucideIcons.Eye,
      Ear: LucideIcons.Ear,
      Check: LucideIcons.Check,
      X: LucideIcons.X,
      Beef: LucideIcons.Beef,
      Apple: LucideIcons.Apple,
      Carrot: LucideIcons.Carrot,
      Banana: LucideIcons.Banana,
      Egg: LucideIcons.Egg,
      Milk: LucideIcons.Milk,
      Pizza: LucideIcons.Pizza,
      IceCream: LucideIcons.IceCream,
      Droplets: LucideIcons.Droplets,
      Utensils: LucideIcons.Utensils,
      Sun: LucideIcons.Sun,
      Moon: LucideIcons.Moon,
      Wind: LucideIcons.Wind,
      Thermometer: LucideIcons.Thermometer,
      Zap: LucideIcons.Zap,
      Cloud: LucideIcons.Cloud,
      Bed: LucideIcons.Bed,
      Toilet: LucideIcons.Toilet,
      Bath: LucideIcons.Bath,
      School: LucideIcons.School,
      Car: LucideIcons.Car,
      House: LucideIcons.House,
      Store: LucideIcons.Store,
      Building: LucideIcons.Building,
      MapPin: LucideIcons.MapPin,
      Church: LucideIcons.Church,
      Tv: LucideIcons.Tv,
      Sofa: LucideIcons.Sofa,
      Book: LucideIcons.Book,
      Pen: LucideIcons.Pen,
      Phone: LucideIcons.Phone,
      Music: LucideIcons.Music,
      Gamepad2: LucideIcons.Gamepad2,
      Bike: LucideIcons.Bike,
      Bus: LucideIcons.Bus,
      Train: LucideIcons.Train,
      Plane: LucideIcons.Plane,
      Pencil: LucideIcons.Pencil,
      Notebook: LucideIcons.Notebook,
      Clipboard: LucideIcons.Clipboard,
      GraduationCap: LucideIcons.GraduationCap,
      Calculator: LucideIcons.Calculator,
      Globe: LucideIcons.Globe,
      Ruler: LucideIcons.Ruler,
      Scissors: LucideIcons.Scissors,
      Palette: LucideIcons.Palette,
      Baby: LucideIcons.Baby,
      Volume2: LucideIcons.Volume2,
      Home: LucideIcons.Home,
      default: LucideIcons.HelpCircle,
    };

    return icons[name] || icons.default;
  };

  const renderContent = () => {
    switch (contentType) {
      case 'lucide-icon': {
        const iconName = imagemUrl!.replace('icon://', '');
        const LucideIcon = getLucideIcon(iconName);
        return <LucideIcon size={iconSize} color="white" strokeWidth={2.5} />;
      }

      case 'image': {
        if (!cleanImageUrl) {
          return <LucideIcons.Image size={iconSize} color="white" />;
        }

        return (
          <>
            {imageLoading && (
              <View style={styles.loading}>
                <ActivityIndicator size="small" color="white" />
              </View>
            )}

            <Image
              source={{ uri: cleanImageUrl }}
              style={[
                styles.image, 
                { 
                  opacity: imageLoading ? 0 : 1,
                  width: imageContainerSize,
                  height: imageContainerSize,
                }
              ]}
              resizeMode="contain"
              fadeDuration={0}
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
              }}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />

            {imageError && (
              <View style={styles.error}>
                <LucideIcons.ImageOff size={iconSize} color="white" />
              </View>
            )}
          </>
        );
      }

      default:
        return Icon ? (
          <Icon size={iconSize} color="white" strokeWidth={2.5} />
        ) : (
          <Text style={[styles.fallback, { fontSize: iconSize * 0.7 }]}>
            {label[0]}
          </Text>
        );
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.container,
        { 
          width: cardSize, 
          height: cardSize,
          backgroundColor: '#8BC5E5',
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[
          styles.imageContainer,
          { 
            width: imageContainerSize, 
            height: imageContainerSize,
            borderRadius: imageContainerSize * 0.2,
          }
        ]}>
          {renderContent()}
        </View>
        <Text style={[
          styles.label, 
          { 
            fontSize: labelFontSize,
            lineHeight: labelFontSize * 1.2,
          }
        ]} 
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        >
          {label.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    margin: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 197, 229, 0.3)',
  },
  error: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  fallback: {
    color: 'white',
    fontWeight: 'bold',
  },
  label: {
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    flexShrink: 1,
    marginTop: 4,
  },
});

export default ItemCard;