import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  User,
  Camera,
  Save,
  Mail,
  Phone,
  Calendar,
  MapPin,
  UserCircle,
} from 'lucide-react-native';

const EditProfile = () => {
  const navigation = useNavigation();
  
  // Estados para os campos do perfil
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome.');
      return;
    }

    console.log('Salvando perfil:', {
      name,
      email,
      phone,
      birthDate,
    });

    Alert.alert(
      'Sucesso!',
      'Perfil atualizado com sucesso.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Alterar Foto',
      'Escolha uma opção:',
      [
        {
          text: 'Tirar Foto',
          onPress: () => console.log('Tirar foto'),
        },
        {
          text: 'Escolher da Galeria',
          onPress: () => console.log('Escolher da galeria'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const InputField = ({ 
    icon: Icon, 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
  }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Icon size={20} color="#8BC5E5" style={styles.inputIcon} />
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={28} color="#8BC5E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          activeOpacity={0.7}
        >
          <Save size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Seção da Foto */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <View style={styles.photo}>
              <User size={80} color="#8BC5E5" />
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleChangePhoto}
                activeOpacity={0.7}
              >
                <Camera size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.photoText}>Toque para alterar a foto</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <InputField
            icon={UserCircle}
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="Digite seu nome"
          />

          <InputField
            icon={Mail}
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu e-mail"
            keyboardType="email-address"
          />

          <InputField
            icon={Phone}
            label="Telefone"
            value={phone}
            onChangeText={setPhone}
            placeholder="Digite seu telefone"
            keyboardType="phone-pad"
          />

          <InputField
            icon={Calendar}
            label="Data de Nascimento"
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="DD/MM/AAAA"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Informações da Conta</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo de Conta:</Text>
              <Text style={styles.infoValue}>Criança em Desenvolvimento</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Membro desde:</Text>
              <Text style={styles.infoValue}>Janeiro 2024</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: '#8BC5E5',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoContainer: {
    marginBottom: 12,
  },
  photo: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(139, 197, 229, 0.1)',
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8BC5E5',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  photoText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
  },
  bioWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingTop: 16,
    minHeight: 120,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 16,
    paddingRight: 8,
  },
  multilineInput: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  bioInput: {
    height: 100,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    paddingLeft: 8,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
});

export default EditProfile;