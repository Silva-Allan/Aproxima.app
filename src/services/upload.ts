// src/services/upload.ts - VERSÃO FINAL CORRIGIDA
import { supabase } from "../lib/supabase";
import * as ImagePicker from 'expo-image-picker';

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

// Importação para toast - você precisará passar a função showToast como parâmetro
// ou configurar um contexto global para toast

export class UploadService {
    private static readonly AVATAR_BUCKET = 'avatars';
    private static readonly GESTOS_BUCKET = 'gestos';
    
    // Função para exibir toast (será injetada ou usada via contexto)
    private static showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;

    // Método para injetar a função showToast
    static setToastHandler(handler: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void) {
        this.showToast = handler;
    }

    private static showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
        // Se showToast estiver configurado, use-o
        if (this.showToast) {
            this.showToast(message, type);
        } else {
            // Fallback para console.log em ambiente de desenvolvimento
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // ============================================
    // MÉTODOS DE SELEÇÃO DE IMAGEM
    // ============================================

    /**
     * Seletor de imagem da galeria - VERSÃO SIMPLIFICADA
     */
    static async pickImageFromGallery(): Promise<string | null> {
        try {
            console.log('📁 Solicitando permissão da galeria...');
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (status !== 'granted') {
                console.warn('❌ Permissão da galeria negada');
                // Usando toast em vez de Alert
                this.showAlert(
                    'Precisamos de permissão para acessar sua galeria de fotos.',
                    'warning'
                );
                return null;
            }

            console.log('📁 Abrindo galeria...');
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'], // ✅ Array de strings
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            console.log('📁 Resultado da galeria:', {
                canceled: result.canceled,
                assetsCount: result.assets?.length || 0
            });

            if (result.canceled || !result.assets?.[0]) {
                console.log('📁 Seleção cancelada');
                return null;
            }

            const imageUri = result.assets[0].uri;
            console.log('✅ Imagem selecionada (resumido):', imageUri.substring(0, 50) + '...');
            
            return imageUri;

        } catch (error: any) {
            console.error('💥 Erro ao selecionar imagem da galeria:', error);
            this.showAlert(
                'Erro ao selecionar imagem. Tente novamente.',
                'error'
            );
            return null;
        }
    }

    /**
     * Tirar foto com câmera - VERSÃO SIMPLIFICADA
     */
    static async takePhotoWithCamera(): Promise<string | null> {
        try {
            console.log('📸 Solicitando permissão da câmera...');
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            
            if (status !== 'granted') {
                console.warn('❌ Permissão da câmera negada');
                // Usando toast em vez de Alert
                this.showAlert(
                    'Precisamos de permissão para acessar sua câmera.',
                    'warning'
                );
                return null;
            }

            console.log('📸 Abrindo câmera...');
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'], // ✅ Array de strings
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            console.log('📸 Resultado da câmera:', {
                canceled: result.canceled,
                assetsCount: result.assets?.length || 0
            });

            if (result.canceled || !result.assets?.[0]) {
                console.log('📸 Captura cancelada');
                return null;
            }

            const imageUri = result.assets[0].uri;
            console.log('✅ Foto tirada (resumido):', imageUri.substring(0, 50) + '...');
            
            return imageUri;

        } catch (error: any) {
            console.error('💥 Erro ao tirar foto:', error);
            this.showAlert(
                'Erro ao tirar foto. Tente novamente.',
                'error'
            );
            return null;
        }
    }

    // ============================================
    // UPLOAD DE AVATAR - VERSÃO CORRIGIDA
    // ============================================

    /**
     * Upload de avatar
     */
    static async uploadAvatar(userId: string, imageUri: string): Promise<UploadResult> {
        try {
            console.log('🚀 UPLOAD INICIADO');
            console.log('👤 User ID:', userId);
            console.log('📱 Image URI (resumido):', imageUri.substring(0, 60) + '...');

            // 1. FETCH DA IMAGEM
            console.log('📥 Fazendo fetch...');
            const response = await fetch(imageUri);
            
            if (!response.ok) {
                throw new Error(`Falha ao carregar imagem: ${response.status}`);
            }

            // 2. LER COMO ARRAY BUFFER (NÃO COMO BLOB!)
            console.log('🔢 Convertendo para ArrayBuffer...');
            const arrayBuffer = await response.arrayBuffer();
            
            console.log(`📦 ArrayBuffer size: ${arrayBuffer.byteLength} bytes`);
            
            if (arrayBuffer.byteLength === 0) {
                throw new Error('ArrayBuffer vazio - imagem não pode ser lida');
            }

            // 3. CONVERTER PARA UINT8ARRAY
            const bytes = new Uint8Array(arrayBuffer);
            console.log(`✅ Bytes preparados: ${bytes.length}`);

            // 4. GERAR NOME DO ARQUIVO
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 10);
            const fileName = `${userId}/avatar_${timestamp}_${random}.jpg`;
            
            console.log(`📁 Nome do arquivo: ${fileName}`);

            // 5. FAZER UPLOAD (COM UINT8ARRAY)
            console.log('⬆️ Enviando para Supabase...');
            const { error } = await supabase.storage
                .from(this.AVATAR_BUCKET)
                .upload(fileName, bytes, {
                    contentType: 'image/jpeg',
                    upsert: true,
                });

            if (error) {
                console.error('❌ Erro no upload:', error);
                this.showAlert('Erro ao fazer upload da imagem.', 'error');
                return { success: false, error: error.message };
            }

            // 6. OBTER URL
            const { data: { publicUrl } } = supabase.storage
                .from(this.AVATAR_BUCKET)
                .getPublicUrl(fileName);

            console.log('✅ Upload concluído! URL:', publicUrl);
            
            this.showAlert('Upload realizado com sucesso!', 'success');
            
            return {
                success: true,
                url: publicUrl
            };

        } catch (error: any) {
            console.error('💥 Erro no upload:', error);
            this.showAlert(
                'Erro ao fazer upload da imagem. Tente novamente.',
                'error'
            );
            return {
                success: false,
                error: error.message || 'Erro desconhecido no upload'
            };
        }
    }

    /**
     * Upload SIMPLIFICADO (alias)
     */
    static async uploadAvatarSimple(userId: string, imageUri: string): Promise<UploadResult> {
        return this.uploadAvatar(userId, imageUri);
    }

    // ============================================
    // UPLOAD DE GESTOS
    // ============================================

    /**
     * Upload de imagem para gesto
     */
    static async uploadGestoImage(userId: string, imageUri: string, gestoId?: number): Promise<UploadResult> {
        try {
            console.log('🎭 Upload de gesto iniciado...');
            
            // Usar o mesmo método do avatar
            const result = await this.uploadAvatar(userId, imageUri);
            
            if (result.success) {
                console.log('✅ Gesto enviado com sucesso');
                this.showAlert('Imagem do gesto enviada com sucesso!', 'success');
            } else {
                this.showAlert('Erro ao enviar imagem do gesto.', 'error');
            }
            
            return result;

        } catch (error: any) {
            console.error('❌ Erro no upload do gesto:', error);
            this.showAlert('Erro ao enviar imagem do gesto. Tente novamente.', 'error');
            return {
                success: false,
                error: error.message || 'Erro no upload do gesto'
            };
        }
    }

    // Aliases para compatibilidade
    static async uploadGestoImageWithArrayBuffer(userId: string, imageUri: string, gestoId?: number): Promise<UploadResult> {
        return this.uploadGestoImage(userId, imageUri, gestoId);
    }

    static async uploadGestoImagem(userId: string, imageUri: string, gestoId?: number): Promise<UploadResult> {
        return this.uploadGestoImage(userId, imageUri, gestoId);
    }

    static async uploadGestoImageSimple(userId: string, imageUri: string, gestoId?: number): Promise<UploadResult> {
        return this.uploadGestoImage(userId, imageUri, gestoId);
    }

    // ============================================
    // MÉTODOS DE UTILIDADE
    // ============================================

    /**
     * Remover avatar do usuário
     */
    static async removeAvatar(userId: string): Promise<boolean> {
        try {
            console.log('🗑️ Removendo avatar do usuário:', userId);

            const { error } = await supabase.storage
                .from(this.AVATAR_BUCKET)
                .remove([`${userId}/`]);

            if (error) {
                console.error('❌ Erro ao remover avatar:', error);
                this.showAlert('Erro ao remover avatar.', 'error');
                return false;
            }

            this.showAlert('Avatar removido com sucesso!', 'success');
            return true;
        } catch (error) {
            console.error('💥 Erro ao remover avatar:', error);
            this.showAlert('Erro ao remover avatar. Tente novamente.', 'error');
            return false;
        }
    }

    /**
     * Obter URL do avatar com cache-busting
     */
    static getAvatarUrl(avatarUrl?: string, userId?: string, size: number = 200): string {
        if (avatarUrl) {
            const timestamp = Date.now();
            const separator = avatarUrl.includes('?') ? '&' : '?';
            return `${avatarUrl}${separator}t=${timestamp}`;
        }

        // Fallback para avatar gerado
        const name = userId ? encodeURIComponent(userId.substring(0, 8)) : 'U';
        return `https://ui-avatars.com/api/?name=${name}&background=8BC5E5&color=fff&bold=true&size=${size}`;
    }

    /**
     * Obter URL de imagem do gesto
     */
    static getGestoImagemUrl(imagemUrl?: string): string | undefined {
        if (!imagemUrl) return undefined;
        const timestamp = Date.now();
        const separator = imagemUrl.includes('?') ? '&' : '?';
        return `${imagemUrl}${separator}t=${timestamp}`;
    }

    /**
     * Verificar se URL é acessível
     */
    static async testImageUrl(url: string): Promise<boolean> {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.error('❌ Erro ao testar URL:', url, error);
            return false;
        }
    }

    /**
     * Verificar se imagem existe e é acessível
     */
    static async verificarImagem(imagemUrl: string): Promise<{ ok: boolean; status?: number; error?: string }> {
        try {
            const response = await fetch(imagemUrl, { method: 'HEAD' });
            return {
                ok: response.ok,
                status: response.status
            };
        } catch (error: any) {
            return {
                ok: false,
                error: error.message
            };
        }
    }
}