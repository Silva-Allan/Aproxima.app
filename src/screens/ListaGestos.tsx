// src/screens/MeusGestos.tsx - CORRIGIDO
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  Home,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react-native';
import { buscarMeusGestos, excluirGesto } from '../services/gestos';
import { categoryData } from '../../utils/categoryData';

const MeusGestos = () => {
  const navigation = useNavigation();
  
  const [meusGestos, setMeusGestos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMeusGestos = async () => {
    setIsLoading(true);
    try {
      const gestos = await buscarMeusGestos();
      setMeusGestos(gestos);
    } catch (error) {
      console.error('Erro ao carregar gestos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus gestos.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMeusGestos();
    }, [])
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleHome = () => {
    (navigation as any).navigate('Home');
  };

  const handleCreateGesto = () => {
    (navigation as any).navigate('CadastrarGesto');
  };

  const handleEditGesto = (gesto: any) => {
    (navigation as any).navigate('CadastrarGesto', { 
      gestoParaEditar: gesto 
    });
  };

  const handleDeleteGesto = (gestoId: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este gesto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirGesto(gestoId);
              Alert.alert('Sucesso!', 'Gesto excluído com sucesso!');
              loadMeusGestos();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o gesto.');
            }
          },
        },
      ]
    );
  };

  const renderGestoItem = ({ item }: { item: any }) => {
    const categoria = categoryData.find((cat) => cat.id === item.categoria_id);
    
    return (
      <View style={styles.gestoItem}>
        <View style={styles.gestoInfo}>
          {item.imagem_url ? (
            <Image source={{ uri: item.imagem_url }} style={styles.gestoImage} />
          ) : (
            <View style={styles.gestoIcon}>
              <Text style={styles.gestoIconText}>{item.nome.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.gestoDetails}>
            <Text style={styles.gestoNome}>{item.nome}</Text>
            <Text style={styles.gestoCategoria}>
              Categoria: {categoria?.name || item.categoria_id}
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
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
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateGesto}
        activeOpacity={0.7}
      >
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
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleCreateGesto}
          >
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
        <View style={styles.navContent}>
          <TouchableOpacity
            onPress={handleHome}
            style={styles.navButton}
            activeOpacity={0.7}
          >
            <Home size={32} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    color: '#000000ff',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  gestoImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  gestoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8BC5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestoIconText: {
    fontSize: 20,
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
    flexDirection: 'row',
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
    backgroundColor: '#ffffffff',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    maxWidth: 400,
    marginHorizontal: 'auto',
  },
  navButton: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 27, 194, 0.6)',
  },
});

export default MeusGestos;