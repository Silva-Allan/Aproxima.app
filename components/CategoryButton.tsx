import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { LucideIcon } from 'lucide-react-native';

interface CategoryButtonProps {
  icon: LucideIcon;
  label: string;
  route: string;
  params?: any;
}

const CategoryButton = ({ 
  icon: Icon, 
  label, 
  route, 
  params 
}: CategoryButtonProps) => {
  const navigation = useNavigation();

  const handlePress = () => {
    // Solução 1: Usar any para bypass do TypeScript
    const nav = navigation as any;
    
    if (params) {
      nav.navigate(route, params);
    } else {
      nav.navigate(route);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const buttonSize = (screenWidth - 48) / 2;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        { 
          width: buttonSize, 
          height: buttonSize,
          backgroundColor: '#8BC5E5' 
        }
      ]}
      activeOpacity={0.7}
      accessibilityLabel={label}
    >
      <View style={styles.content}>
        <Icon size={56} color="white" strokeWidth={2.5} />
        <Text style={styles.label}>{label}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
  },
});

export default CategoryButton;