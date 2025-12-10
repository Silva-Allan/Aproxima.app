import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Home,
  Plus,
  FolderPlus,
  List,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleHome = () => {
    (navigation as any).navigate('Home');
  };

  const handleCreateGesto = () => {
    (navigation as any).navigate('CadastrarGesto');
  };

  const handleListGestos = () => {
    (navigation as any).navigate('MeusGestos');
  };

  const mainOptions = [
    {
      icon: Plus,
      title: 'Criar Gesto',
      description: 'Adicionar novo gesto personalizado',
      onPress: handleCreateGesto,
      color: '#8BC5E5',
    },
    {
      icon: List,
      title: 'Meus Gestos',
      description: 'Ver, editar ou excluir seus gestos',
      onPress: handleListGestos,
      color: '#8BC5E5',
    },
  ];

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
        <Text style={styles.headerTitle}>Gerenciamento</Text>
      </View>

      {/* Opções principais */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {mainOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.settingCard, { backgroundColor: option.color }]}
            activeOpacity={0.7}
            onPress={option.onPress}
          >
            <option.icon size={40} color="white" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>{option.title}</Text>
              <Text style={styles.settingDescription}>{option.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
    justifyContent: 'flex-start',
    gap: 16,
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
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000ff',
    marginTop: 16,
    marginHorizontal: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 100,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    padding: 24,
    marginBottom: 16,
    gap: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
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

export default Settings;