import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Home, ArrowLeft } from 'lucide-react-native';
import ItemCard from '../components/ItemCard';
import { categoryData } from '../utils/categoryData';

/**
 * Tela de itens da categoria - Estilo Figma
 * Fundo azul claro, grid 2 colunas com cards brancos
 */
const CategoryItems = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Solução para o TypeScript: usar as any ou extrair de forma segura
  const params = route.params as any;
  const categoryId = params?.categoryId;

  const category = categoryData.find((cat) => cat.id === categoryId);

  if (!category) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Categoria não encontrada</Text>
      </View>
    );
  }

  const handleItemSelect = () => {
    console.log("Item selecionado");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleHome = () => {
    // Solução: usar as any para bypass do TypeScript
    (navigation as any).navigate('Home');
  };

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 48) / 2; // 24px padding + 8px gap

  return (
    <View style={styles.container}>
      {/* Grid de itens */}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {category.items.map((item, index) => (
            <View key={index} style={{ width: itemWidth, marginBottom: 16 }}>
              <ItemCard
                icon={item.icon}
                label={item.label}
                onSelect={handleItemSelect}
              />
            </View>
          ))}
        </View>
      </ScrollView>

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
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 120,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  },
  navButton: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default CategoryItems;