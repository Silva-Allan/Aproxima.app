import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Volume2, Palette, Type, Home } from 'lucide-react-native';

const Settings = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleHome = () => {
    // Solução para TypeScript
    (navigation as any).navigate('Home');
  };

  const settingOptions = [
    {
      icon: Volume2,
      title: 'Sons',
      description: 'Configurar sons dos botões',
      onPress: () => console.log('Abrir configurações de som'),
    },
    {
      icon: Palette,
      title: 'Aparência',
      description: 'Personalizar cores e imagens',
      onPress: () => console.log('Abrir configurações de aparência'),
    },
    {
      icon: Type,
      title: 'Texto',
      description: 'Tamanho e tipo de fonte',
      onPress: () => console.log('Abrir configurações de texto'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header com botão voltar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel="Voltar"
        >
          <ArrowLeft size={28} color="#8BC5E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      {/* Opções de configuração */}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {settingOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingCard}
            activeOpacity={0.7}
            onPress={option.onPress}
          >
            <option.icon size={40} color="#8BC5E5" />
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
            accessibilityLabel="Home"
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
    backgroundColor: '#A8D8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8BC5E5',
    marginLeft: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 100,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
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
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
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
    justifyContent: 'center',
    maxWidth: 400,
    marginHorizontal: 'auto',
  },
  navButton: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default Settings;