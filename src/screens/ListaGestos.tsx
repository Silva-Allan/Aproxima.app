// src/screens/MeusGestos.tsx - VERSÃO CORRIGIDA
import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  ImageSourcePropType
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Home,
  Edit,
  Trash2,
  Plus,
  Hand,
  Bird,
  Smile,
  Heart,
  ThumbsUp,
  Frown,
  Meh,
  Laugh,
  Angry,
  Star,
  Moon,
  Sun,
  Droplets,
  Zap,
  Flame,
  CloudSnow,
  Thermometer,
  Activity,
} from 'lucide-react-native';
import { buscarMeusGestos, excluirGesto } from '../services/gestos';
import { categoryData } from '../../utils/categoryData';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';

// Defina o tipo das suas rotas para melhor autocompletar
type RootStackParamList = {
  Home: undefined;
  CadastrarGesto: { gestoParaEditar?: any; modo?: string } | undefined;
  EditGesto: { gesto: any };
  MeusGestos: undefined;
  // Adicione outras rotas conforme necessário
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const MeusGestos = () => {
  const navigation = useNavigation<NavigationProps>();
  const [meusGestos, setMeusGestos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para modais
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGesto, setSelectedGesto] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Hook para toast
  const showToast = useToast();

  const loadMeusGestos = async () => {
    setIsLoading(true);
    try {
      const gestos = await buscarMeusGestos();
      console.log('✅ Gestos carregados:', gestos.length, 'gestos');
      setMeusGestos(gestos);
    } catch (error) {
      console.error('Erro ao carregar gestos:', error);
      showToast({
        message: 'Não foi possível carregar seus gestos.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMeusGestos();
    }, [])
  );

  // FUNÇÕES DE NAVEGAÇÃO - CORRIGIDAS
  const handleBack = () => {
    navigation.goBack();
  };

  const handleHome = () => {
    navigation.navigate('Home');
  };

  // CORREÇÃO: Use 'CadastrarGesto' em vez de 'CreateGesto'
  const handleCreateGesto = () => {
    navigation.navigate('CadastrarGesto');
  };

  // CORREÇÃO: Tipagem corrigida
  const handleEditGesto = (gesto: any) => {
    // Navega para a tela de cadastro com os dados do gesto para edição
    navigation.navigate('CadastrarGesto', {
      gestoParaEditar: gesto,
      modo: 'editar'
    });
  };

  const handleDeleteGesto = async (gestoId: number) => {
    setSelectedGesto(gestoId);
    setShowDeleteModal(true);
  };

  const confirmDeleteGesto = async () => {
    if (!selectedGesto) return;

    try {
      await excluirGesto(selectedGesto);
      setSuccessMessage('Gesto excluído com sucesso!');
      setShowSuccessModal(true);
      // Recarregar a lista após exclusão
      loadMeusGestos();
    } catch (error) {
      console.error('Erro ao excluir gesto:', error);
      showToast({
        message: 'Não foi possível excluir o gesto.',
        type: 'error'
      });
    } finally {
      setShowDeleteModal(false);
      setSelectedGesto(null);
    }
  };

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

  const renderGestoImage = (gesto: any) => {
    const { id, imagem_url, iconeName, nome } = gesto;

    // 1. Ícone nativo
    if (imagem_url?.startsWith('icon://') || iconeName) {
      const iconName = imagem_url?.startsWith('icon://')
        ? imagem_url.replace('icon://', '')
        : iconeName;

      const IconComponent = getIconComponent(iconName);

      return (
        <View style={styles.gestoIconContainer}>
          <IconComponent size={28} color="white" />
        </View>
      );
    }

    // 2. Imagem URL
    if (imagem_url && (
      imagem_url.startsWith('https://') ||
      imagem_url.startsWith('http://')
    )) {
      return (
        <View style={styles.gestoImageContainer}>
          <Image
            source={{ uri: imagem_url } as ImageSourcePropType}
            style={styles.gestoImage}
            resizeMode="cover"
            onError={() => console.warn(`Erro ao carregar imagem: ${imagem_url}`)}
          />
        </View>
      );
    }

    // 3. Fallback
    return (
      <View style={styles.gestoFallbackIcon}>
        <Text style={styles.gestoIconText}>{nome?.charAt(0)?.toUpperCase() || '?'}</Text>
      </View>
    );
  };

  const renderGestoItem = ({ item }: { item: any }) => {
    const categoria = categoryData.find((cat) => cat.id === item.categoria_id);

    return (
      <View style={styles.gestoItem}>
        <View style={styles.gestoInfo}>
          {renderGestoImage(item)}
          <View style={styles.gestoDetails}>
            <Text style={styles.gestoNome}>{item.nome || 'Gesto sem nome'}</Text>
            <Text style={styles.gestoCategoria}>
              {categoria?.name || 'Sem categoria'}
            </Text>
            {item.descricao && (
              <Text style={styles.gestoDescricao} numberOfLines={2}>
                {item.descricao}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.gestoActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditGesto(item)}
          >
            <Edit size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteGesto(item.id)}
          >
            <Trash2 size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={28} color="#8BC5E5" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Meus Gestos</Text>
            <Text style={styles.headerSubtitle}>
              {meusGestos.length} {meusGestos.length === 1 ? 'gesto' : 'gestos'} criados
            </Text>
          </View>
        </View>

        {/* Botão para criar novo gesto */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreateGesto}>
          <Plus size={20} color="white" />
          <Text style={styles.createButtonText}>Criar Novo Gesto</Text>
        </TouchableOpacity>

        {/* Lista de gestos */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8BC5E5" />
            <Text style={styles.loadingText}>Carregando seus gestos...</Text>
          </View>
        ) : meusGestos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Você ainda não criou nenhum gesto.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreateGesto}>
              <Text style={styles.emptyButtonText}>Criar Primeiro Gesto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={meusGestos}
            renderItem={renderGestoItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.gestosList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Navegação inferior */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={handleHome} style={styles.navButton}>
            <Home size={32} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de confirmação para excluir gesto */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este gesto?"
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteGesto}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedGesto(null);
        }}
      />

      {/* Modal de sucesso */}
      <ConfirmModal
        visible={showSuccessModal}
        title="Sucesso"
        message={successMessage}
        confirmText="OK"
        cancelText=""
        onConfirm={() => setShowSuccessModal(false)}
        onCancel={() => setShowSuccessModal(false)}
      />
    </>
  );
};

// Estilos (mantenha os mesmos)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(139, 197, 229, 0.1)',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  createButton: {
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
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#8BC5E5',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  gestosList: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  gestoItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gestoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  gestoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#8BC5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestoImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden' as const,
    backgroundColor: '#f8f9fa',
  },
  gestoImage: {
    width: '100%',
    height: '100%',
  },
  gestoFallbackIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#8BC5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestoIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  gestoDetails: {
    flex: 1,
  },
  gestoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  gestoCategoria: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  gestoDescricao: {
    fontSize: 12,
    color: '#999',
  },
  gestoActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#8BC5E5',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navButton: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 27, 194, 0.6)',
  },
});

export default MeusGestos;