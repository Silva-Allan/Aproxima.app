// src/screens/EditProfile.tsx
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  User,
  Camera,
  Save,
  Mail,
  Phone,
  Calendar,
  UserCircle,
  Loader2,
  Image as ImageIcon,
  X,
  LogOut, // ✅ Adicionado
  Shield, // ✅ Adicionado
  AlertCircle, // ✅ Adicionado
} from 'lucide-react-native';
import { buscarPerfilUsuario, atualizarPerfil, UserProfile } from '../services/auth';
import { UploadService } from '../services/upload';
import { useAuth } from '../contexts/AuthContext'; // ✅ Corrigido: removido singOut

const EditProfile = () => {
  const navigation = useNavigation();
  const { signOut } = useAuth(); // ✅ Corrigido: use signOut (com 'n') do AuthContext

  // Estados para os campos do perfil
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Carregar dados do usuário sempre que a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
      return () => { };
    }, [])
  );

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const profile = await buscarPerfilUsuario();
      setUserProfile(profile);
      setUserData(profile);
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);

      if (error.message === "Usuário não autenticado") {
        Alert.alert(
          'Sessão expirada',
          'Sua sessão expirou. Por favor, faça login novamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login' as never),
            },
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setUserData = (profile: UserProfile) => {
    setNome(profile.nome || '');
    setEmail(profile.email || '');
    setTelefone(profile.telefone || '');
    setDataNascimento(profile.data_nascimento || '');
    setAvatarUrl(profile.avatar_url);
  };

  const formatPhone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const formatDate = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return numbers.replace(/(\d{2})(\d{2})/, '$1/$2');
    } else {
      return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    }
  };

  const validateForm = () => {
    if (!nome.trim()) return "Por favor, insira seu nome.";
    if (telefone && telefone.replace(/\D/g, '').length < 10) return "Por favor, insira um telefone válido.";
    if (dataNascimento && dataNascimento.length < 10) return "Por favor, insira uma data de nascimento válida.";
    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Atenção', error);
      return;
    }

    setIsSaving(true);
    try {
      const updates = {
        nome: nome.trim(),
        telefone: telefone ? telefone.replace(/\D/g, '') : '',
        data_nascimento: dataNascimento || '',
      };

      const updatedProfile = await atualizarPerfil(updates);

      if (updatedProfile) {
        setUserProfile(updatedProfile);
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
      }
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível salvar as alterações. Tente novamente.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // ✅ FUNÇÃO DE LOGOUT CORRIGIDA
  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              await signOut(); // ✅ Agora está correto
              // O AuthContext já deve redirecionar automaticamente para Login
            } catch (error: any) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert(
                'Erro',
                'Não foi possível sair da conta. Tente novamente.'
              );
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  // FUNÇÃO PARA EXCLUIR CONTA (opcional)
  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      '⚠️ ATENÇÃO: Esta ação é irreversível!\n\nTodos os seus dados, gestos e informações serão permanentemente excluídos.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir Conta',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmação Final',
              'Tem certeza ABSOLUTA que deseja excluir sua conta? Esta ação não pode ser desfeita.',
              [
                {
                  text: 'Cancelar',
                  style: 'cancel',
                },
                {
                  text: 'EXCLUIR CONTA',
                  style: 'destructive',
                  onPress: () => {
                    // Aqui você implementaria a exclusão da conta
                    Alert.alert(
                      'Funcionalidade em desenvolvimento',
                      'A exclusão de conta estará disponível em breve.'
                    );
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleChangePhoto = async () => {
    Alert.alert(
      'Alterar Foto',
      'Escolha uma opção:',
      [
        {
          text: 'Tirar Foto',
          onPress: () => handleTakePhoto(),
        },
        {
          text: 'Escolher da Galeria',
          onPress: () => handlePickImage(),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const handlePickImage = async () => {
    setIsUploading(true);
    try {
      const imageUri = await UploadService.pickImageFromGallery();
      if (imageUri) {
        await uploadAvatar(imageUri);
      }
    } catch (error: any) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', error.message || 'Não foi possível selecionar a imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    setIsUploading(true);
    try {
      const imageUri = await UploadService.takePhotoWithCamera();
      if (imageUri) {
        await uploadAvatar(imageUri);
      }
    } catch (error: any) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', error.message || 'Não foi possível tirar a foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!userProfile?.id) return;

    Alert.alert(
      'Remover Foto',
      'Tem certeza que deseja remover sua foto de perfil?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setIsUploading(true);
            try {
              const success = await UploadService.removeAvatar(userProfile.id);
              if (success) {
                // Atualizar perfil para remover a URL do avatar
                const updatedProfile = await atualizarPerfil({
                  avatar_url: undefined
                });

                setAvatarUrl(undefined);
                if (updatedProfile) {
                  setUserProfile(updatedProfile);
                }

                Alert.alert('Sucesso', 'Foto removida com sucesso.');
              } else {
                Alert.alert('Erro', 'Não foi possível remover a foto.');
              }
            } catch (error: any) {
              console.error('Erro ao remover foto:', error);
              Alert.alert('Erro', 'Não foi possível remover a foto.');
            } finally {
              setIsUploading(false);
            }
          },
        },
      ]
    );
  };

  const uploadAvatar = async (imageUri: string) => {
    if (!userProfile?.id) return;

    setIsUploading(true);
    try {
      console.log('🔄 Iniciando upload da imagem...');

      // Usar o método SIMPLES primeiro
      const uploadResult = await UploadService.uploadAvatarSimple(userProfile.id, imageUri);

      if (!uploadResult.success) {
        // Se o método simples falhar, tentar o método normal
        console.log('🔄 Método simples falhou, tentando método normal...');
        const secondTry = await UploadService.uploadAvatar(userProfile.id, imageUri);

        if (!secondTry.success) {
          throw new Error(secondTry.error || 'Falha no upload');
        }

        uploadResult.success = secondTry.success;
        uploadResult.url = secondTry.url;
      }

      if (uploadResult.success && uploadResult.url) {
        console.log('✅ Upload bem-sucedido, atualizando perfil...');

        // Atualizar perfil com nova URL
        const updatedProfile = await atualizarPerfil({
          avatar_url: uploadResult.url
        });

        if (updatedProfile) {
          setAvatarUrl(uploadResult.url);
          setUserProfile(updatedProfile);
          Alert.alert('Sucesso!', 'Foto atualizada com sucesso.');
        } else {
          Alert.alert('Erro', 'Não foi possível salvar a nova foto.');
        }
      } else {
        Alert.alert('Erro no Upload', uploadResult.error || 'Não foi possível fazer upload da imagem.');
      }
    } catch (error: any) {
      console.error('❌ Erro no upload:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a foto. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
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
    disabled = false,
    maxLength,
  }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, disabled && styles.inputDisabled]}>
        <Icon size={20} color="#8BC5E5" style={styles.inputIcon} />
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            disabled && styles.textDisabled,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={!disabled && !isSaving && !isUploading}
          maxLength={maxLength}
        />
      </View>
    </View>
  );

  const renderPhotoSection = () => (
    <View style={styles.photoSection}>
      <View style={styles.photoContainer}>
        <TouchableOpacity
          style={[styles.photo, isUploading && styles.photoDisabled]}
          onPress={handleChangePhoto}
          activeOpacity={0.7}
          disabled={isSaving || isUploading}
        >
          {/* Círculo de destaque ao redor da foto */}
          <View style={styles.photoRing}>
            {avatarUrl ? (
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
                {isUploading && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator size="large" color="white" />
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.defaultAvatar}>
                <User size={80} color="#01090dff" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.photoText}>
        {isUploading ? 'Processando...' : 'Toque para alterar a foto'}
      </Text>

      {avatarUrl && !isUploading && (
        <TouchableOpacity
          style={styles.removePhotoButton}
          onPress={handleRemovePhoto}
          disabled={isSaving}
        >
          <X size={16} color="#ff4444" />
          <Text style={styles.removePhotoText}>Remover foto</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8BC5E5" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

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
          disabled={isSaving || isUploading}
        >
          <ArrowLeft size={28} color="#8BC5E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[
            styles.saveButton,
            (isSaving || isUploading) && styles.saveButtonDisabled,
          ]}
          activeOpacity={0.7}
          disabled={isSaving || isUploading}
        >
          {isSaving ? (
            <Loader2 size={20} color="white" style={styles.loadingIcon} />
          ) : (
            <Save size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Seção da Foto */}
        {renderPhotoSection()}

        {/* Formulário */}
        <View style={styles.form}>
          <InputField
            icon={UserCircle}
            label="Nome *"
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome"
            disabled={false}
          />

          <InputField
            icon={Mail}
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu e-mail"
            keyboardType="email-address"
            disabled={true}
          />

          <InputField
            icon={Phone}
            label="Telefone"
            value={telefone}
            onChangeText={(text: string) => setTelefone(formatPhone(text))}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            maxLength={15}
            disabled={false}
          />

          <InputField
            icon={Calendar}
            label="Data de Nascimento"
            value={dataNascimento}
            onChangeText={(text: string) => setDataNascimento(formatDate(text))}
            placeholder="DD/MM/AAAA"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            disabled={false}
          />
        </View>

        {/* Informações da Conta */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Informações da Conta</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID do Usuário:</Text>
              <Text style={styles.infoValueSmall}>
                {userProfile?.id?.substring(0, 8)}...
              </Text>
            </View>
            {userProfile?.avatar_updated_at && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Foto atualizada em:</Text>
                <Text style={styles.infoValue}>
                  {new Date(userProfile.avatar_updated_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Conta criada em:</Text>
              <Text style={styles.infoValue}>
                {userProfile?.created_at
                  ? new Date(userProfile.created_at).toLocaleDateString('pt-BR')
                  : 'Não disponível'}
              </Text>
            </View>
            {userProfile?.updated_at && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Última atualização:</Text>
                <Text style={styles.infoValue}>
                  {new Date(userProfile.updated_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ✅ SEÇÃO: Configurações de Segurança e Conta */}
        <View style={styles.securitySection}>
          <Text style={styles.securityTitle}>Segurança e Conta</Text>

          {/* Botão de Logout */}
          <TouchableOpacity
            style={[styles.logoutButton, (isSaving || isUploading) && styles.buttonDisabled]}
            onPress={handleLogout}
            activeOpacity={0.7}
            disabled={isSaving || isUploading}
          >
            <LogOut size={20} color="#ff4444" style={styles.buttonIcon} />
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>

          {/* Botão para Excluir Conta (opcional) */}
          <TouchableOpacity
            style={[styles.deleteAccountButton, (isSaving || isUploading) && styles.buttonDisabled]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
            disabled={isSaving || isUploading}
          >
            <AlertCircle size={20} color="#ff4444" style={styles.buttonIcon} />
            <Text style={styles.deleteAccountText}>Excluir Minha Conta</Text>
          </TouchableOpacity>

          {/* Informações de segurança */}
          <View style={styles.securityInfo}>
            <View style={styles.securityInfoHeader}>
              <Shield size={20} color="#8BC5E5" />
              <Text style={styles.securityInfoTitle}>Suas Informações estão Seguras</Text>
            </View>
            <Text style={styles.securityInfoText}>
              • Dados protegidos por criptografia{'\n'}
              • Nenhuma informação é compartilhada com terceiros{'\n'}
              • Você pode excluir sua conta a qualquer momento
            </Text>
          </View>
        </View>

        {/* Espaço extra para scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingIcon: {
    transform: [{ rotate: '0deg' }],
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
    position: 'relative',
  },
  photo: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  photoDisabled: {
    opacity: 0.7,
  },
  photoRing: {
    width: 160,
    height: 160,
    borderRadius: 100,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 4,
    borderColor: '#8BC5E5',
    overflow: 'hidden',
  },
  avatarContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(139, 197, 229, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 70,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 70,
  },
  photoText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 12,
    marginBottom: 8,
  },
  removePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.2)',
    marginTop: 8,
  },
  removePhotoText: {
    fontSize: 14,
    color: '#ff4444',
    marginLeft: 6,
    fontWeight: '500',
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
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
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
  textDisabled: {
    color: '#999',
  },
  multilineInput: {
    paddingTop: 16,
    paddingBottom: 16,
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
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
  infoValueSmall: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'monospace',
  },
  // ✅ NOVOS ESTILOS PARA A SEÇÃO DE SEGURANÇA
  securitySection: {
    marginTop: 8,
    marginBottom: 40,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    paddingLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.2)',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.05)',
    borderRadius: 12,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.1)',
    borderStyle: 'dashed',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
    flex: 1,
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
    flex: 1,
    opacity: 0.8,
  },
  securityInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  securityInfoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
  changePasswordButton: {
    backgroundColor: 'rgba(139, 197, 229, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 197, 229, 0.3)',
  },
  changePasswordText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8BC5E5',
  },
  securityInfo: {
    backgroundColor: 'rgba(139, 197, 229, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 197, 229, 0.2)',
    marginTop: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default EditProfile;