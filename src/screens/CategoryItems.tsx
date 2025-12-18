// src/screens/CategoryItems.tsx - CORRIGIDO ÍCONES
import { 
  useNavigation, 
  useRoute, 
  useFocusEffect,
  CommonActions,
  NavigationProp 
} from '@react-navigation/native';
import { ArrowLeft, Home, Plus, Hand, LucideIcon } from 'lucide-react-native';
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
import { categoryData } from './Categories';
import { buscarGestosPorCategoria, Gesto } from '../services/gestos';

// Ajuste a interface para usar o tipo Gesto do serviço
interface CustomGesto {
  id: number;
  nome: string;
  imagem_url: string | null;
  icone_label?: string;
  icone_name?: string;
}

// Interface para os itens combinados
interface CombinedItem {
  id: string;
  type: 'native' | 'custom';
  label: string;
  icon: React.ComponentType<any>; // Aceita tanto LucideIcon quanto outros componentes
  imagemUrl?: string;
}

// Defina os tipos das rotas
type RootStackParamList = {
  Home: undefined;
  CadastrarGesto: { defaultCategoryId?: string; gestoParaEditar?: any };
  Categories: undefined;
  CategoryItems: { categoryId: string };
  Login: undefined;
  Cadastro: undefined;
  Choices: undefined;
  Profile: undefined;
  Settings: undefined;
  MeusGestos: undefined;
  NotFound: undefined;
};

// Defina o tipo para a navegação
type CategoryItemsNavigationProp = NavigationProp<RootStackParamList, 'CategoryItems'>;

/**
 * Tela de itens da categoria - MOSTRA GESTOS NATIVOS + PERSONALIZADOS
 */
const CategoryItems = () => {
  const navigation = useNavigation<CategoryItemsNavigationProp>();
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
      setError("Não foi possível carregar os gestos. Verifique sua conexão.");
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
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Categories');
    }
  };

  const handleHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  };

  const handleAddGesto = () => {
    navigation.navigate('CadastrarGesto', {
      defaultCategoryId: categoryId
    });
  };

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 48) / 2;

  if (!category) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Categoria não encontrada</Text>
        <TouchableOpacity onPress={handleBack} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#8BC5E5" />
        <Text style={styles.loadingText}>Carregando itens...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Erro ao carregar</Text>
        <Text style={styles.errorDescription}>{error}</Text>
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBack} style={[styles.retryButton, { marginTop: 10 }]}>
          <Text style={styles.retryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Função para obter ícone LucideIcon - CORRIGIDA
  const getIconComponent = (iconName: string): React.ComponentType<any> => {
    try {
      const lucideIcons = require('lucide-react-native');
      const IconComponent = lucideIcons[iconName];
      
      if (!IconComponent) {
        console.warn(`Ícone não encontrado: ${iconName}, usando Hand como fallback`);
        return Hand;
      }
      
      return IconComponent;
    } catch (error) {
      console.error('Erro ao carregar ícone:', error);
      return Hand;
    }
  };

  // Combinar itens nativos e personalizados CORRETAMENTE
  const allItems: CombinedItem[] = [
    // Itens nativos - já têm ícones corretos
    ...nativeItems.map((item, index) => ({
      id: `native-${index}`,
      type: 'native' as const,
      label: item.label,
      icon: item.icon || Hand, // Usa o ícone original
      imagemUrl: undefined
    })),
    // Itens personalizados
    ...customGestos.map(gesto => {
      // Verifica se é um ícone
      const isIcon = gesto.imagem_url?.startsWith?.('icon://');
      
      // Determina o ícone a ser usado
      let iconComponent: React.ComponentType<any> = Hand;
      
      if (isIcon && gesto.imagem_url) {
        const iconName = gesto.imagem_url.replace('icon://', '');
        iconComponent = getIconComponent(iconName);
      } else if (gesto.icone_name) {
        iconComponent = getIconComponent(gesto.icone_name);
      }

      return {
        id: `custom-${gesto.id}`,
        type: 'custom' as const,
        label: gesto.nome,
        icon: iconComponent,
        // Passa a imagem apenas se não for ícone
        imagemUrl: isIcon ? undefined : (gesto.imagem_url || undefined)
      };
    })
  ];

  // Log para debug
  console.log('📊 Categoria:', category.name);
  console.log('📊 Itens nativos:', nativeItems.length);
  console.log('📊 Gestos personalizados:', customGestos.length);
  console.log('📊 Primeiro item nativo:', nativeItems[0]?.label, 'Ícone:', nativeItems[0]?.icon?.name || nativeItems[0]?.icon);

  // Verifica se há itens
  const hasItems = allItems.length > 0;

  return (
    <View style={styles.container}>
      {/* Header da categoria */}
      <View style={styles.categoryHeader}>
        <View style={styles.categoryHeaderContent}>
          <Text style={styles.categoryTitle}>{category.name}</Text>
          <Text style={styles.categorySubtitle}>
            {allItems.length} {allItems.length === 1 ? 'item' : 'itens'}
            {customGestos.length > 0 && ` • ${customGestos.length} personalizado${customGestos.length > 1 ? 's' : ''}`}
          </Text>
        </View>
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

      {/* Grid de itens ou mensagem vazia */}
      {hasItems ? (
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
                  imagemUrl={item.imagemUrl}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum item encontrado nesta categoria</Text>
          <Text style={styles.emptySubtext}>Adicione seu primeiro gesto personalizado!</Text>
          <TouchableOpacity
            style={[styles.addButton, { marginTop: 20 }]}
            onPress={handleAddGesto}
            activeOpacity={0.7}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>Criar Primeiro Gesto</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Navegação inferior */}
      <View style={styles.bottomNav}>
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
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={32} color="white" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Estilos mantidos igual
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4444',
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
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
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  categoryHeaderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#A8D8F0',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  navButton: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default CategoryItems;