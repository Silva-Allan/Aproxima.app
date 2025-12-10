// src/screens/CategoryItems.tsx - CORRIGIDO
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Home, Plus } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import ItemCard from '../../components/ItemCard';
import { categoryData } from '../../utils/categoryData';
import { buscarGestosPorCategoria, Gesto } from '../services/gestos';

// Ajuste a interface para usar o tipo Gesto do serviço
interface CustomGesto {
  id: number; // Alterado para number (serial no banco)
  nome: string;
  imagem_url: string | null;
  icone_label?: string;
  icone_name?: string;
}

/**
 * Tela de itens da categoria - MOSTRA GESTOS NATIVOS + PERSONALIZADOS
 */
const CategoryItems = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const params = route.params as any;
  const categoryId = params?.categoryId;

  const [nativeItems, setNativeItems] = useState<any[]>([]);
  const [customGestos, setCustomGestos] = useState<CustomGesto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const category = categoryData.find((cat) => cat.id === categoryId);

  // Função para carregar dados
  const loadData = useCallback(async () => {
    if (!categoryId) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Carregar itens nativos da categoria
      if (category) {
        setNativeItems(category.items);
      }

      // 2. Carregar gestos personalizados da mesma categoria
      const gestos: Gesto[] = await buscarGestosPorCategoria(categoryId);
      
      // Converter gestos para formato compatível
      const convertedGestos: CustomGesto[] = gestos.map(gesto => ({
        id: gesto.id,
        nome: gesto.nome,
        imagem_url: gesto.imagem_url,
        icone_label: gesto.icone_label || gesto.nome,
        icone_name: gesto.icone_name || 'Hand'
      }));

      setCustomGestos(convertedGestos);
      
    } catch (error: any) {
      console.error("Erro ao carregar gestos:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, category]);

  // Carregar dados quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleItemSelect = (label: string) => {
    console.log("Item selecionado:", label);
    // Aqui você pode adicionar TTS se quiser
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleHome = () => {
    (navigation as any).navigate('Home');
  };

  const handleAddGesto = () => {
    // Navegar para cadastrar novo gesto nessa categoria
    (navigation as any).navigate('CadastrarGesto', { 
      defaultCategoryId: categoryId 
    });
  };

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 48) / 2; // 24px padding + 8px gap

  if (!category) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Categoria não encontrada</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#8BC5E5" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Erro: {error}</Text>
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Importar ícones do lucide-react-native corretamente
  const getIconComponent = (iconName: string | undefined) => {
    // Mapeamento de nomes de ícones para componentes
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'ThumbsUp': require('lucide-react-native').ThumbsUp,
      'Hand': require('lucide-react-native').Hand,
      'Smile': require('lucide-react-native').Smile,
      'Heart': require('lucide-react-native').Heart,
      'HeartHand': require('lucide-react-native').Heart,
      'Eye': require('lucide-react-native').Eye,
      'Ear': require('lucide-react-native').Ear,
      'Frown': require('lucide-react-native').Frown,
      'Laugh': require('lucide-react-native').Laugh,
      'Angry': require('lucide-react-native').Angry,
      'Meh': require('lucide-react-native').Meh,
      'Droplets': require('lucide-react-native').Droplets,
      'Zap': require('lucide-react-native').Zap,
      'Sun': require('lucide-react-native').Sun,
      'Moon': require('lucide-react-native').Moon,
      'Wind': require('lucide-react-native').Wind,
      'Thermometer': require('lucide-react-native').Thermometer,
      'Home': require('lucide-react-native').Home,
      'Bed': require('lucide-react-native').Bed,
      'Toilet': require('lucide-react-native').Toilet,
      'Bath': require('lucide-react-native').Bath,
      'School': require('lucide-react-native').School,
      'Car': require('lucide-react-native').Car,
    };
    
    return iconName ? iconMap[iconName] || iconMap['Hand'] : iconMap['Hand'];
  };

  // Combinar itens nativos e personalizados
  const allItems = [
    ...nativeItems.map((item, index) => ({
      ...item,
      id: `native-${index}`,
      type: 'native' as const,
      imagem_url: undefined
    })),
    ...customGestos.map(gesto => ({
      icon: getIconComponent(gesto.icone_name),
      label: gesto.nome,
      type: 'custom' as const,
      id: `custom-${gesto.id}`,
      imagem_url: gesto.imagem_url
    }))
  ];

  return (
    <View style={styles.container}>
      {/* Header da categoria */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{category.name}</Text>
        <Text style={styles.categorySubtitle}>
          {allItems.length} {allItems.length === 1 ? 'item' : 'itens'}
          {customGestos.length > 0 && ` (${customGestos.length} personalizado${customGestos.length > 1 ? 's' : ''})`}
        </Text>
      </View>

      {/* Botão para adicionar novo gesto */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddGesto}
        activeOpacity={0.7}
      >
        <Plus size={20} color="white" />
        <Text style={styles.addButtonText}>Adicionar Gesto</Text>
      </TouchableOpacity>

      {/* Grid de itens */}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {allItems.map((item) => (
            <View key={item.id} style={{ width: itemWidth, marginBottom: 16 }}>
              <ItemCard
                icon={item.icon}
                label={item.label}
                onSelect={() => handleItemSelect(item.label)}
                imagemUrl={item.imagem_url || undefined}
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8BC5E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  categoryHeader: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#8BC5E5',
  },
  categorySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8BC5E5',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    gap: 32,
  },
  navButton: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default CategoryItems;