// src/components/ItemCard.tsx
import React, { useState, useEffect, useMemo } from 'react';
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
}

const ItemCard = ({ icon: Icon, label, onSelect, imagemUrl }: ItemCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const cardSize = (screenWidth - 48) / 2;

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
      imagemUrl.startsWith('content://')
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
      default: LucideIcons.Hand,
    };

    return icons[name] || icons.default;
  };

  const renderContent = () => {
    switch (contentType) {
      case 'lucide-icon': {
        const iconName = imagemUrl!.replace('icon://', '');
        const LucideIcon = getLucideIcon(iconName);
        return <LucideIcon size={56} color="white" strokeWidth={2.5} />;
      }

      case 'image': {
        if (!cleanImageUrl) {
          return <LucideIcons.Image size={56} color="white" />;
        }

        return (
          <>
            {imageLoading && (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="white" />
              </View>
            )}

            <Image
              source={{ uri: cleanImageUrl }}
              style={[styles.image, { opacity: imageLoading ? 0 : 1 }]}
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
                <LucideIcons.ImageOff size={56} color="white" />
              </View>
            )}
          </>
        );
      }

      default:
        return Icon ? (
          <Icon size={56} color="white" strokeWidth={2.5} />
        ) : (
          <Text style={styles.fallback}>{label[0]}</Text>
        );
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.container,
        { width: cardSize, height: cardSize, backgroundColor: '#8BC5E5' },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.imageContainer}>{renderContent()}</View>
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
    marginBottom: 16,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
    width: '100%',
    height: '100%',
    minHeight: 280,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  error: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallback: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
  },
});

export default ItemCard;
