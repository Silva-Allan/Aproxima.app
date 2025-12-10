import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Modal,
  FlatList,
  ActivityIndicator
} from "react-native";
import {
  ArrowLeft,
  Save,
  Camera,
  X,
  FolderOpen,
  Loader2
} from "lucide-react-native";
import { criarGesto, atualizarGesto } from "../services/gestos";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UploadService } from "../services/upload";
import { categoryData, Category, CategoryItem } from "./Categories";

export default function CadastrarGesto() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const params = route.params as any;
  const defaultCategoryId = params?.defaultCategoryId;
  const gestoParaEditar = params?.gestoParaEditar;

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    defaultCategoryId
      ? categoryData.find(cat => cat.id === defaultCategoryId) || null
      : null
  );

  useEffect(() => {
    if (gestoParaEditar) {
      setNome(gestoParaEditar.nome);
      setDescricao(gestoParaEditar.descricao || '');
      setImagemUri(gestoParaEditar.imagem_url);
      const categoria = categoryData.find(cat => cat.id === gestoParaEditar.categoria_id);
      setSelectedCategory(categoria || null);
    }
  }, [gestoParaEditar]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePickImage = async () => {
    setIsUploading(true);
    try {
      const imageUri = await UploadService.pickImageFromGallery();
      if (imageUri) {
        setImagemUri(imageUri);
      }
    } catch (error: any) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", error.message || "Não foi possível selecionar a imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    setIsUploading(true);
    try {
      const imageUri = await UploadService.takePhotoWithCamera();
      if (imageUri) {
        setImagemUri(imageUri);
      }
    } catch (error: any) {
      console.error("Erro ao tirar foto:", error);
      Alert.alert("Erro", error.message || "Não foi possível tirar a foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    Alert.alert(
      "Remover Imagem",
      "Tem certeza que deseja remover a imagem?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            setImagemUri(null);
          },
        },
      ]
    );
  };

  const handleChangeImage = () => {
    Alert.alert(
      "Escolher Imagem",
      "Selecione a origem da imagem:",
      [
        {
          text: "Tirar Foto",
          onPress: () => handleTakePhoto(),
        },
        {
          text: "Escolher da Galeria",
          onPress: () => handlePickImage(),
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false); // Fechar modal diretamente
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleSelectCategory(item)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryIcon}>
        <FolderOpen size={24} color="#8BC5E5" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>{item.items.length} itens</Text>
    </TouchableOpacity>
  );

  async function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Por favor, insira um nome para o gesto.");
      return;
    }

    if (!imagemUri) {
      Alert.alert("Atenção", "Por favor, adicione uma imagem para o gesto.");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Atenção", "Por favor, selecione uma categoria para o gesto.");
      return;
    }

    setIsLoading(true);
    try {
      let imagemUrl = "";

      // Se a imagem for uma URI local e for diferente da atual, fazer upload
      if ((imagemUri.startsWith('file://') || imagemUri.startsWith('content://')) &&
        imagemUri !== gestoParaEditar?.imagem_url) {
        setIsUploading(true);
        try {
          const uploadResult = await UploadService.uploadGestoImage(user?.id || '', imagemUri, gestoParaEditar?.id);
          if (uploadResult.success && uploadResult.url) {
            imagemUrl = uploadResult.url;
          } else {
            throw new Error(uploadResult.error || 'Falha no upload da imagem');
          }
        } catch (uploadError: any) {
          console.error("Erro no upload:", uploadError);
          throw new Error("Falha ao fazer upload da imagem: " + uploadError.message);
        } finally {
          setIsUploading(false);
        }
      } else {
        // Se já for uma URL (remota) ou é a mesma imagem, usar diretamente
        imagemUrl = imagemUri;
      }

      if (gestoParaEditar) {
        await atualizarGesto(gestoParaEditar.id, {
          nome: nome.trim(),
          descricao: descricao.trim(),
          categoria_id: selectedCategory.id,
          iconeLabel: "",
          iconeName: "",
          imagemUrl
        });

        Alert.alert(
          "Sucesso!",
          "Gesto atualizado com sucesso!",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // Criar novo gesto
        await criarGesto({
          nome: nome.trim(),
          descricao: descricao.trim(),
          categoria_id: selectedCategory.id,
          iconeLabel: "",
          iconeName: "",
          imagemUrl
        });

        Alert.alert(
          "Sucesso!",
          "Gesto criado com sucesso!",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Erro ao salvar gesto:", error);
      Alert.alert("Erro", error.message || "Não foi possível salvar o gesto. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  const renderImageSection = () => (
    <View style={styles.imageSection}>
      <Text style={styles.sectionTitle}>Imagem do Gesto *</Text>

      {imagemUri ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imagemUri }} style={styles.imagePreview} />
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={[styles.imageActionButton, styles.changeButton]}
              onPress={handleChangeImage}
              disabled={isUploading}
            >
              <Camera size={20} color="white" />
              <Text style={styles.imageActionText}>Trocar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imageActionButton, styles.removeButton]}
              onPress={handleRemoveImage}
              disabled={isUploading}
            >
              <X size={20} color="white" />
              <Text style={styles.imageActionText}>Remover</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.imageUploadButton, isUploading && styles.uploadButtonDisabled]}
          onPress={handleChangeImage}
          disabled={isUploading}
          activeOpacity={0.7}
        >
          {isUploading ? (
            <ActivityIndicator size="large" color="#8BC5E5" />
          ) : (
            <>
              <Camera size={40} color="#8BC5E5" />
              <Text style={styles.imageUploadText}>Adicionar Imagem</Text>
              <Text style={styles.imageUploadSubtext}>Toque para tirar foto ou escolher da galeria</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCategorySection = () => (
    <View style={styles.categorySection}>
      <Text style={styles.sectionTitle}>Categoria *</Text>

      {selectedCategory ? (
        <View style={styles.selectedCategoryContainer}>
          <View style={styles.selectedCategoryInfo}>
            <View style={styles.selectedIconContainer}>
              <FolderOpen size={24} color="#8BC5E5" />
            </View>
            <View style={styles.selectedCategoryDetails}>
              <Text style={styles.selectedCategoryName}>{selectedCategory.name}</Text>
              <Text style={styles.selectedCategoryDesc}>
                {selectedCategory.items.length} gestos nativos
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.clearCategoryButton}
            onPress={handleClearCategory}
          >
            <X size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.selectCategoryButton}
          onPress={() => setShowCategoryModal(true)}
          activeOpacity={0.7}
        >
          <FolderOpen size={24} color="#8BC5E5" />
          <Text style={styles.selectCategoryText}>Selecionar Categoria</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          disabled={isLoading || isUploading}
        >
          <ArrowLeft size={28} color="#8BC5E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastrar Gesto</Text>
      </View>

      {/* Conteúdo */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          {/* Seção da Imagem */}
          {renderImageSection()}

          {/* Seção da Categoria */}
          {renderCategorySection()}

          {/* Campo Nome */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome do Gesto *</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              style={styles.input}
              placeholder="Ex: Sim, Não, Mais"
              placeholderTextColor="#999"
              maxLength={50}
              editable={!isLoading && !isUploading}
            />
            <Text style={styles.charCount}>{nome.length}/50</Text>
          </View>

          {/* Campo Descrição */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Descrição (Opcional)</Text>
            <TextInput
              value={descricao}
              onChangeText={setDescricao}
              style={[styles.input, styles.textArea]}
              placeholder="Descreva como fazer este gesto..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
              editable={!isLoading && !isUploading}
            />
            <Text style={styles.charCount}>{descricao.length}/200</Text>
          </View>

          {/* Informações de exemplo */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Dicas:</Text>
            <Text style={styles.infoText}>
              • Use fotos claras do gesto{"\n"}
              • Escolha a categoria correta{"\n"}
              • Use nomes simples e diretos{"\n"}
              • Descreva movimentos claros{"\n"}
            </Text>
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (isLoading || isUploading || !nome.trim() || !imagemUri || !selectedCategory) && styles.saveButtonDisabled
            ]}
            onPress={handleSalvar}
            activeOpacity={0.7}
            disabled={isLoading || isUploading || !nome.trim() || !imagemUri || !selectedCategory}
          >
            {isLoading || isUploading ? (
              <>
                <Loader2 size={20} color="white" style={styles.loadingIcon} />
                <Text style={styles.saveButtonText}>Salvando...</Text>
              </>
            ) : (
              <>
                <Save size={20} color="white" />
                <Text style={styles.saveButtonText}>Salvar Gesto</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Categorias */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione uma Categoria</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              key="category-list"
              data={categoryData}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.categoryList}
              numColumns={1}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: "white",
    shadowColor: "#000",
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
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  imageSection: {
    marginBottom: 24,
  },
  imagePreviewContainer: {
    alignItems: "center",
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
  },
  imageActions: {
    flexDirection: "row",
    gap: 12,
  },
  imageActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
  },
  changeButton: {
    backgroundColor: "#8BC5E5",
  },
  removeButton: {
    backgroundColor: "#ff4444",
  },
  imageActionText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  imageUploadButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    borderRadius: 16,
    padding: 40,
    borderWidth: 2,
    borderColor: "#8BC5E5",
    borderStyle: "dashed",
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  imageUploadText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8BC5E5",
    marginTop: 16,
    marginBottom: 8,
  },
  imageUploadSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  categorySection: {
    marginBottom: 24,
  },
  selectCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(139, 197, 229, 0.3)",
  },
  selectCategoryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8BC5E5",
  },
  selectedCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#8BC5E5",
  },
  selectedCategoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  selectedIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedCategoryDetails: {
    flex: 1,
  },
  selectedCategoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  selectedCategoryDesc: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  clearCategoryButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
    marginRight: 4,
  },
  infoBox: {
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#8BC5E5",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8BC5E5",
    borderRadius: 16,
    padding: 18,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  loadingIcon: {
    transform: [{ rotate: "0deg" }],
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: {
    padding: 8,
  },
  categoryList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  categoryCount: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});