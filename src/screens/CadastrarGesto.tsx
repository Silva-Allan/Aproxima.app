import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Dimensions
} from "react-native";
import {
  ArrowLeft,
  Save,
  Camera,
  X,
  FolderOpen,
  Loader2,
  Search,
  Check,
  Grid3x3,
  List
} from "lucide-react-native";
import { criarGesto, atualizarGesto } from "../services/gestos";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UploadService } from "../services/upload";
import { categoryData, Category } from "./Categories";
import { allIconsList, iconCategories, IconName, getIconComponent } from "../../utils/icons";
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { ActionSheetModal } from '../../components/ActionSheetModal';

type IconCategoryKey = keyof typeof iconCategories;

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
  const [showIconModal, setShowIconModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    defaultCategoryId
      ? categoryData.find(cat => cat.id === defaultCategoryId) || null
      : null
  );
  const [iconSearch, setIconSearch] = useState("");
  const [selectedIconCategory, setSelectedIconCategory] = useState<IconCategoryKey | null>(null);
  const [selectedIconName, setSelectedIconName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Estados para os modais
  const [showImageOptionsModal, setShowImageOptionsModal] = useState(false);
  const [showRemoveImageModal, setShowRemoveImageModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState("");
  const [successModalMessage, setSuccessModalMessage] = useState("");

  const screenWidth = Dimensions.get('window').width;
  const iconSize = (screenWidth - 80) / 4;

  // Hook para toast
  const showToast = useToast();

  useEffect(() => {
    if (gestoParaEditar) {
      setNome(gestoParaEditar.nome);
      setDescricao(gestoParaEditar.descricao || '');
      setImagemUri(gestoParaEditar.imagem_url);
      const categoria = categoryData.find(cat => cat.id === gestoParaEditar.categoria_id);
      setSelectedCategory(categoria || null);

      // Se a imagem for um ícone (começa com icon://)
      if (gestoParaEditar.imagem_url?.startsWith('icon://')) {
        const iconName = gestoParaEditar.imagem_url.replace('icon://', '');
        setSelectedIconName(iconName);
      }
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
        setSelectedIconName(null);
        setShowImageOptionsModal(false);
      }
    } catch (error: any) {
      console.error("Erro ao selecionar imagem:", error);
      showToast({
        message: error.message || "Não foi possível selecionar a imagem.",
        type: 'error'
      });
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
        setSelectedIconName(null);
        setShowImageOptionsModal(false);
      }
    } catch (error: any) {
      console.error("Erro ao tirar foto:", error);
      showToast({
        message: error.message || "Não foi possível tirar a foto.",
        type: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectIcon = () => {
    setShowIconModal(true);
    setShowImageOptionsModal(false);
    setIsUploading(false);
  };

  const handleIconSelected = (iconName: string) => {
    const iconUri = `icon://${iconName}`;
    setImagemUri(iconUri);
    setSelectedIconName(iconName);
    setShowIconModal(false);
  };

  const handleRemoveImage = () => {
    setImagemUri(null);
    setSelectedIconName(null);
    setShowRemoveImageModal(false);
  };

  const handleChangeImage = () => {
    setShowImageOptionsModal(true);
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
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

  const filteredIcons = allIconsList.filter(icon => {
    const matchesSearch = iconSearch === '' ||
      icon.name.toLowerCase().includes(iconSearch.toLowerCase());

    if (selectedIconCategory) {
      const categoryIcons = iconCategories[selectedIconCategory];
      return matchesSearch && categoryIcons?.includes(icon.name);
    }

    return matchesSearch;
  });

  const renderIconItemGrid = ({ item }: { item: typeof allIconsList[0] }) => {
    const IconComponent = item.component;
    const isSelected = selectedIconName === item.name;

    return (
      <TouchableOpacity
        style={[
          styles.iconItemGrid,
          isSelected && styles.iconItemSelected
        ]}
        onPress={() => handleIconSelected(item.name)}
        activeOpacity={0.6}
      >
        <View style={[
          styles.iconContainerGrid,
          isSelected && styles.iconContainerSelected
        ]}>
          <IconComponent size={32} color={isSelected ? "white" : "#8BC5E5"} />
        </View>
        <Text
          style={[
            styles.iconNameGrid,
            isSelected && styles.iconNameSelected
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        {isSelected && (
          <View style={styles.iconCheckmark}>
            <Check size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderIconItemList = ({ item }: { item: typeof allIconsList[0] }) => {
    const IconComponent = item.component;
    const isSelected = selectedIconName === item.name;

    return (
      <TouchableOpacity
        style={[
          styles.iconItemList,
          isSelected && styles.iconItemSelected
        ]}
        onPress={() => handleIconSelected(item.name)}
        activeOpacity={0.6}
      >
        <View style={[
          styles.iconContainerList,
          isSelected && styles.iconContainerSelected
        ]}>
          <IconComponent size={24} color={isSelected ? "white" : "#8BC5E5"} />
        </View>
        <Text
          style={[
            styles.iconNameList,
            isSelected && styles.iconNameSelected
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        {isSelected && (
          <View style={styles.iconCheckmark}>
            <Check size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCategoryChip = (category: IconCategoryKey, index: number) => {
    const isSelected = selectedIconCategory === category;
    const iconCount = iconCategories[category]?.length || 0;

    return (
      <TouchableOpacity
        key={`category-chip-${category}-${index}`}
        style={[
          styles.categoryChip,
          isSelected && styles.categoryChipSelected
        ]}
        onPress={() => setSelectedIconCategory(isSelected ? null : category)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.categoryChipText,
          isSelected && styles.categoryChipTextSelected
        ]}>
          {category} ({iconCount})
        </Text>
      </TouchableOpacity>
    );
  };

  // FUNÇÃO PRINCIPAL CORRIGIDA
  async function handleSalvar() {
    if (!nome.trim()) {
      showToast({
        message: "Por favor, insira um nome para o gesto.",
        type: 'warning'
      });
      return;
    }

    if (!imagemUri) {
      showToast({
        message: "Por favor, adicione uma imagem para o gesto.",
        type: 'warning'
      });
      return;
    }

    if (!selectedCategory) {
      showToast({
        message: "Por favor, selecione uma categoria para o gesto.",
        type: 'warning'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      let imagemUrl = "";
      let iconeName = "";
      let iconeLabel = "";

      console.log("🔄 Iniciando salvamento do gesto...");
      console.log("📁 imagemUri:", imagemUri?.substring(0, 50));

      // 1. Se for um ícone nativo (começa com icon://)
      if (imagemUri.startsWith('icon://')) {
        const iconName = imagemUri.replace('icon://', '');
        imagemUrl = imagemUri;
        iconeName = iconName;
        iconeLabel = iconName;
        console.log("✅ É um ícone:", iconName);
      }
      // 2. Se já for uma URL remota (HTTPS/HTTP)
      else if (imagemUri.startsWith('https://') || imagemUri.startsWith('http://')) {
        console.log("🔗 É uma URL remota, mantendo:", imagemUri?.substring(0, 100));
        imagemUrl = imagemUri;
      }
      // 3. Para qualquer outro tipo (base64, blob, file://) - FAZ UPLOAD
      else {
        console.log(`📤 Fazendo upload de imagem...`);
        setIsUploading(true);
        try {
          const uploadResult = await UploadService.uploadGestoImage(
            user?.id || '',
            imagemUri
          );

          console.log("📊 Resultado do upload:", uploadResult);

          if (uploadResult.success && uploadResult.url) {
            imagemUrl = uploadResult.url;
            console.log("✅ Upload bem-sucedido, URL:", imagemUrl);
          } else {
            throw new Error(uploadResult.error || 'Falha no upload da imagem');
          }
        } catch (uploadError: any) {
          console.error("❌ Erro no upload:", uploadError);
          throw new Error("Falha ao fazer upload da imagem: " + uploadError.message);
        } finally {
          setIsUploading(false);
        }
      }

      console.log("💾 Dados para salvar:", {
        nome: nome.trim(),
        descricao: descricao.trim(),
        categoria_id: selectedCategory.id,
        iconeLabel,
        iconeName,
        imagemUrl
      });

      if (gestoParaEditar) {
        console.log("✏️ Atualizando gesto existente ID:", gestoParaEditar.id);
        await atualizarGesto(gestoParaEditar.id, {
          nome: nome.trim(),
          descricao: descricao.trim(),
          categoria_id: selectedCategory.id,
          iconeLabel: iconeLabel,
          iconeName: iconeName,
          imagemUrl: imagemUrl
        });

        setSuccessModalTitle("Sucesso!");
        setSuccessModalMessage("Gesto atualizado com sucesso!");
        setShowSuccessModal(true);
      } else {
        console.log("🆕 Criando novo gesto");
        await criarGesto({
          nome: nome.trim(),
          descricao: descricao.trim(),
          categoria_id: selectedCategory.id,
          iconeLabel: iconeLabel,
          iconeName: iconeName,
          imagemUrl: imagemUrl
        });

        setSuccessModalTitle("Sucesso!");
        setSuccessModalMessage("Gesto criado com sucesso!");
        setShowSuccessModal(true);
      }

      console.log("✅ Gesto salvo com sucesso!");

    } catch (error: any) {
      console.error("❌ Erro ao salvar gesto:", error);
      showToast({
        message: error.message || "Não foi possível salvar o gesto. Tente novamente.",
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }

  const renderImageSection = () => {
    if (imagemUri?.startsWith('icon://')) {
      const iconName = imagemUri.replace('icon://', '') as IconName;
      const IconComponent = getIconComponent(iconName);

      return (
        <View key="image-section-icon" style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Ícone do Gesto *</Text>
          <View style={styles.imagePreviewContainer}>
            <View style={styles.iconPreview}>
              <IconComponent size={80} color="#8BC5E5" />
              <Text style={styles.iconPreviewName}>{iconName}</Text>
            </View>
            <View style={styles.imageActions}>
              <TouchableOpacity
                key="change-button"
                style={[styles.imageActionButton, styles.changeButton]}
                onPress={handleChangeImage}
                disabled={isUploading}
              >
                <Camera size={20} color="white" />
                <Text style={styles.imageActionText}>Trocar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                key="remove-button"
                style={[styles.imageActionButton, styles.removeButton]}
                onPress={() => setShowRemoveImageModal(true)}
                disabled={isUploading}
              >
                <X size={20} color="white" />
                <Text style={styles.imageActionText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View key="image-section-normal" style={styles.imageSection}>
        <Text style={styles.sectionTitle}>Imagem do Gesto *</Text>

        {imagemUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imagemUri }} style={styles.imagePreview} />
            <View style={styles.imageActions}>
              <TouchableOpacity
                key="change-button-img"
                style={[styles.imageActionButton, styles.changeButton]}
                onPress={handleChangeImage}
                disabled={isUploading}
              >
                <Camera size={20} color="white" />
                <Text style={styles.imageActionText}>Trocar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                key="remove-button-img"
                style={[styles.imageActionButton, styles.removeButton]}
                onPress={() => setShowRemoveImageModal(true)}
                disabled={isUploading}
              >
                <X size={20} color="white" />
                <Text style={styles.imageActionText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            key="upload-button"
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
                <Text style={styles.imageUploadText}>Adicionar Imagem ou Ícone</Text>
                <Text style={styles.imageUploadSubtext}>Toque para tirar foto, escolher da galeria ou selecionar ícone</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderCategorySection = () => (
    <View key="category-section" style={styles.categorySection}>
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
            key="clear-category-button"
            style={styles.clearCategoryButton}
            onPress={handleClearCategory}
          >
            <X size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          key="select-category-button"
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
    <>
      <View style={styles.container}>
        {/* Header */}
        <View key="header" style={styles.header}>
          <TouchableOpacity
            key="back-button"
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
            disabled={isLoading || isUploading}
          >
            <ArrowLeft size={28} color="#8BC5E5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {gestoParaEditar ? "Editar Gesto" : "Cadastrar Gesto"}
          </Text>
        </View>

        {/* Conteúdo */}
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View key="form-card" style={styles.formCard}>
            {/* Seção da Imagem */}
            {renderImageSection()}

            {/* Seção da Categoria */}
            {renderCategorySection()}

            {/* Campo Nome */}
            <View key="nome-field" style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome do Gesto *</Text>
              <TextInput
                key="nome-input"
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
            <View key="descricao-field" style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descrição (Opcional)</Text>
              <TextInput
                key="descricao-input"
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
            <View key="info-box" style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 Dicas:</Text>
              <Text style={styles.infoText}>
                • Use fotos claras do gesto{"\n"}
                • Ou selecione um ícone nativo{"\n"}
                • Escolha a categoria correta{"\n"}
                • Use nomes simples e diretos{"\n"}
                • Descreva movimentos claros{"\n"}
              </Text>
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity
              key="save-button"
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
                  <Text style={styles.saveButtonText}>
                    {gestoParaEditar ? "Atualizar Gesto" : "Salvar Gesto"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal de Categorias */}
        <Modal
          key="category-modal"
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
                  key="close-category-modal"
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

        {/* Modal de Seleção de Ícones */}
        <Modal
          key="icon-modal"
          visible={showIconModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowIconModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.iconModalContent]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecione um Ícone</Text>
                <TouchableOpacity
                  key="close-icon-modal"
                  onPress={() => setShowIconModal(false)}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {/* Barra de pesquisa */}
              <View key="search-container" style={styles.searchContainer}>
                <Search size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  key="search-input"
                  style={styles.searchInput}
                  placeholder="Pesquisar ícones..."
                  value={iconSearch}
                  onChangeText={setIconSearch}
                  placeholderTextColor="#999"
                />
                {iconSearch.length > 0 && (
                  <TouchableOpacity
                    key="clear-search-button"
                    onPress={() => setIconSearch('')}
                    style={styles.clearSearchButton}
                  >
                    <X size={18} color="#666" />
                  </TouchableOpacity>
                )}
              </View>

              {/* View Mode Toggle */}
              <View key="view-mode-container" style={styles.viewModeContainer}>
                <TouchableOpacity
                  key="grid-view-button"
                  style={[
                    styles.viewModeButton,
                    viewMode === 'grid' && styles.viewModeButtonActive
                  ]}
                  onPress={() => setViewMode('grid')}
                >
                  <Grid3x3 size={20} color={viewMode === 'grid' ? "white" : "#666"} />
                </TouchableOpacity>
                <TouchableOpacity
                  key="list-view-button"
                  style={[
                    styles.viewModeButton,
                    viewMode === 'list' && styles.viewModeButtonActive
                  ]}
                  onPress={() => setViewMode('list')}
                >
                  <List size={20} color={viewMode === 'list' ? "white" : "#666"} />
                </TouchableOpacity>
              </View>

              {/* Categorias de ícones */}
              <ScrollView
                key="categories-scroll"
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesScroll}
                contentContainerStyle={styles.categoriesContainer}
              >
                {(Object.keys(iconCategories) as IconCategoryKey[]).map((category, index) =>
                  renderCategoryChip(category, index)
                )}
              </ScrollView>

              {/* Contador de ícones */}
              <View key="icon-count-container" style={styles.iconCountContainer}>
                <Text style={styles.iconCountText}>
                  {filteredIcons.length} ícones encontrados
                </Text>
              </View>

              {/* Lista de ícones */}
              <FlatList
                key={`icon-list-${viewMode}`}
                data={filteredIcons}
                renderItem={viewMode === 'grid' ? renderIconItemGrid : renderIconItemList}
                keyExtractor={(item) => item.name}
                numColumns={viewMode === 'grid' ? 4 : 1}
                contentContainerStyle={[
                  styles.iconList,
                  viewMode === 'grid' && styles.iconListGrid,
                  viewMode === 'list' && styles.iconListList
                ]}
              />
            </View>
          </View>
        </Modal>
      </View>

      {/* Modal de opções de imagem */}
      <ActionSheetModal
        visible={showImageOptionsModal}
        title="Escolher Imagem"
        actions={[
          {
            label: "Tirar Foto",
            onPress: handleTakePhoto
          },
          {
            label: "Escolher da Galeria",
            onPress: handlePickImage
          },
          {
            label: "Selecionar Ícone Nativo",
            onPress: handleSelectIcon
          }
        ]}
        onCancel={() => setShowImageOptionsModal(false)}
      />

      {/* Modal de confirmação para remover imagem */}
      <ConfirmModal
        visible={showRemoveImageModal}
        title="Remover Imagem"
        message="Tem certeza que deseja remover a imagem?"
        confirmText="Remover"
        cancelText="Cancelar"
        onConfirm={handleRemoveImage}
        onCancel={() => setShowRemoveImageModal(false)}
      />

      {/* Modal de sucesso */}
      <ConfirmModal
        visible={showSuccessModal}
        title={successModalTitle}
        message={successModalMessage}
        confirmText="OK"
        cancelText=""
        onConfirm={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
        onCancel={() => setShowSuccessModal(false)}
      />
    </>
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
    paddingTop: 20,
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
  iconPreview: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#8BC5E5",
    borderStyle: "dashed",
  },
  iconPreviewName: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    fontWeight: "500",
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
    textAlign: "center",
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
    height: "80%",
  },
  iconModalContent: {
    maxHeight: "90%",
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

  // Icon Modal Styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearSearchButton: {
    padding: 4,
  },
  viewModeContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewModeButtonActive: {
    backgroundColor: "#8BC5E5",
  },
  categoriesScroll: {
    marginHorizontal: 24,
    marginBottom: 16,
    minHeight: 36,
    maxHeight: 36,
  },
  categoriesContainer: {
    paddingHorizontal: 4,
  },
  categoryChip: {
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryChipSelected: {
    backgroundColor: "#8BC5E5",
    borderColor: "#8BC5E5",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryChipTextSelected: {
    color: "white",
  },
  iconCountContainer: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  iconCountText: {
    fontSize: 14,
    color: "#666",
  },
  iconList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  iconListGrid: {
    paddingHorizontal: 16,
  },
  iconListList: {
    paddingHorizontal: 8,
  },
  iconItemGrid: {
    alignItems: "center",
    padding: 8,
    width: (Dimensions.get('window').width - 80) / 4,
    position: "relative",
  },
  iconItemList: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    position: "relative",
  },
  iconItemSelected: {
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    borderColor: "#8BC5E5",
  },
  iconContainerGrid: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  iconContainerList: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  iconContainerSelected: {
    backgroundColor: "#8BC5E5",
    borderColor: "#8BC5E5",
  },
  iconNameGrid: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    width: "100%",
  },
  iconNameList: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  iconNameSelected: {
    color: "#8BC5E5",
    fontWeight: "600",
  },
  iconCheckmark: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#8BC5E5",
    borderRadius: 999,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});