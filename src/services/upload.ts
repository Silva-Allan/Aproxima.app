// src/services/upload.ts - VERSÃO FINAL CORRIGIDA
import { supabase } from "../lib/supabase";
import * as ImagePicker from 'expo-image-picker';

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export class UploadService {
    private static readonly AVATAR_BUCKET = 'avatars';
    private static readonly GESTOS_BUCKET = 'gestos';

    /**
     * Seletor de imagem da galeria - VERSÃO FUNCIONAL
     */
    static async pickImageFromGallery(): Promise<string | null> {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Permissão da galeria negada');
                return null;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled || !result.assets[0]) {
                return null;
            }

            return result.assets[0].uri;

        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            return null;
        }
    }

    /**
     * Tirar foto com câmera - VERSÃO FUNCIONAL
     */
    static async takePhotoWithCamera(): Promise<string | null> {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Permissão da câmera negada');
                return null;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled || !result.assets[0]) {
                return null;
            }

            return result.assets[0].uri;

        } catch (error) {
            console.error('Erro ao tirar foto:', error);
            return null;
        }
    }

    /**
     * Método CORRETO para converter blob para base64 no React Native
     */
    private static async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                const base64 = base64data.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Upload de avatar - MÉTODO PRINCIPAL
     */
    static async uploadAvatar(userId: string, imageUri: string): Promise<UploadResult> {
        try {
            console.log('🚀 Iniciando upload para usuário:', userId);

            // 1. Buscar a imagem usando fetch
            console.log('📥 Buscando imagem...');
            const response = await fetch(imageUri);

            if (!response.ok) {
                throw new Error(`Falha ao carregar imagem: ${response.status}`);
            }

            // 2. Converter para blob
            const blob = await response.blob();
            console.log('📦 Tamanho da imagem:', blob.size, 'bytes');

            // 3. Converter blob para base64
            console.log('🔄 Convertendo para base64...');
            const base64 = await this.blobToBase64(blob);

            if (!base64) {
                throw new Error('Falha ao converter imagem para base64');
            }

            // 4. Converter base64 para ArrayBuffer
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const arrayBuffer = bytes.buffer;

            // 5. Gerar nome único do arquivo
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 9);
            const fileName = `${userId}/avatar_${timestamp}_${random}.jpg`;

            console.log('📁 Nome do arquivo:', fileName);

            // 6. Fazer upload para Supabase Storage
            console.log('⬆️  Enviando para Supabase Storage...');

            const { data, error } = await supabase.storage
                .from(this.AVATAR_BUCKET)
                .upload(fileName, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true,
                    cacheControl: '3600',
                });

            if (error) {
                console.error('❌ ERRO NO UPLOAD:', error);

                // Tentar método simplificado como fallback
                return await this.uploadAvatarSimple(userId, imageUri);
            }

            // 7. Obter URL pública
            const { data: { publicUrl } } = supabase.storage
                .from(this.AVATAR_BUCKET)
                .getPublicUrl(fileName);

            console.log('✅ Upload concluído! URL:', publicUrl);

            return {
                success: true,
                url: publicUrl
            };

        } catch (error: any) {
            console.error('💥 ERRO NO PROCESSO DE UPLOAD:', error);
            return {
                success: false,
                error: error.message || 'Erro desconhecido no upload'
            };
        }
    }

    /**
     * Upload SIMPLIFICADO - Método mais confiável
     */
    static async uploadAvatarSimple(userId: string, imageUri: string): Promise<UploadResult> {
        try {
            console.log('📤 Upload simplificado iniciado...');

            // Método usando FileReader diretamente
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // Converter para base64 usando FileReader
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    const base64Data = result.split(',')[1];
                    resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            // Converter base64 para Uint8Array
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Gerar nome do arquivo
            const fileName = `${userId}/avatar_${Date.now()}.jpg`;

            // Upload
            const { error } = await supabase.storage
                .from(this.AVATAR_BUCKET)
                .upload(fileName, bytes, {
                    contentType: 'image/jpeg',
                    upsert: true,
                });

            if (error) throw error;

            // Obter URL
            const { data: { publicUrl } } = supabase.storage
                .from(this.AVATAR_BUCKET)
                .getPublicUrl(fileName);

            return { success: true, url: publicUrl };

        } catch (error: any) {
            console.error('❌ Upload simplificado falhou:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Upload de imagem para gesto - ÚNICO MÉTODO
     */
    static async uploadGestoImage(userId: string, imageUri: string, gestoId?: number): Promise<UploadResult> {
        try {
            console.log('📤 Upload de gesto iniciado para usuário:', userId);
            console.log('📷 URI da imagem:', imageUri);

            // Gerar nome único do arquivo
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 9);
            
            // Usar gestoId se fornecido, caso contrário criar nome temporário
            const gestoIdPart = gestoId ? `gesto_${gestoId}` : 'temp';
            const fileName = `${userId}/${gestoIdPart}_${timestamp}_${random}.jpg`;

            console.log('📁 Nome do arquivo:', fileName);

            // Converter imagem para blob
            const response = await fetch(imageUri);
            if (!response.ok) {
                throw new Error(`Falha ao carregar imagem: ${response.status}`);
            }

            const blob = await response.blob();
            console.log('📦 Tamanho do blob:', blob.size, 'bytes');

            // Fazer upload para Supabase Storage
            const { error } = await supabase.storage
                .from(this.GESTOS_BUCKET)
                .upload(fileName, blob, {
                    contentType: 'image/jpeg',
                    upsert: true,
                    cacheControl: '3600',
                });

            if (error) {
                console.error('❌ Erro no upload:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            // Obter URL pública CORRETA
            const { data: { publicUrl } } = supabase.storage
                .from(this.GESTOS_BUCKET)
                .getPublicUrl(fileName);

            console.log('✅ Upload concluído! URL:', publicUrl);

            // Testar se a URL é acessível
            try {
                const testResponse = await fetch(publicUrl);
                console.log('🔗 Teste de URL:', testResponse.status);
                if (!testResponse.ok) {
                    console.warn('⚠️ URL pode ter problemas de acesso:', testResponse.status);
                }
            } catch (testError) {
                console.warn('⚠️ Teste de URL falhou:', testError);
            }

            return {
                success: true,
                url: publicUrl
            };

        } catch (error: any) {
            console.error('💥 Erro no upload:', error);
            return {
                success: false,
                error: error.message || 'Erro desconhecido no upload'
            };
        }
    }

    /**
     * Upload de imagem para gesto - ALIAS para compatibilidade (com "m")
     */
    static async uploadGestoImagem(userId: string, imageUri: string, gestoId?: number): Promise<UploadResult> {
        return this.uploadGestoImage(userId, imageUri, gestoId);
    }

    /**
     * Remover avatar do usuário
     */
    static async removeAvatar(userId: string): Promise<boolean> {
        try {
            console.log('🗑️  Removendo avatar do usuário:', userId);

            const { data: files, error: listError } = await supabase.storage
                .from(this.AVATAR_BUCKET)
                .list(userId);

            if (listError) {
                console.error('❌ Erro ao listar arquivos:', listError);
                return false;
            }

            if (!files || files.length === 0) {
                console.log('ℹ️  Nenhum arquivo encontrado para remover');
                return true;
            }

            const filesToRemove = files.map(file => `${userId}/${file.name}`);
            const { error: deleteError } = await supabase.storage
                .from(this.AVATAR_BUCKET)
                .remove(filesToRemove);

            if (deleteError) {
                console.error('❌ Erro ao remover avatar:', deleteError);
                return false;
            }

            console.log('✅ Avatar(s) removido(s) com sucesso');
            return true;

        } catch (error) {
            console.error('💥 Erro ao remover avatar:', error);
            return false;
        }
    }

    /**
     * Obter URL do avatar
     */
    static getAvatarUrl(avatarUrl?: string, userId?: string, size: number = 200): string {
        if (avatarUrl) {
            // Adicionar timestamp para evitar cache
            return `${avatarUrl}?t=${Date.now()}`;
        }

        const name = userId ? userId.substring(0, 8) : 'U';
        return `https://ui-avatars.com/api/?name=${name}&background=8BC5E5&color=fff&bold=true&size=${size}`;
    }

    /**
     * Obter URL de imagem do gesto
     */
    static getGestoImagemUrl(imagemUrl?: string): string | undefined {
        if (!imagemUrl) return undefined;
        // Adicionar timestamp para evitar cache
        return `${imagemUrl}?t=${Date.now()}`;
    }

    /**
     * Verificar se URL é acessível
     */
    static async testImageUrl(url: string): Promise<boolean> {
        try {
            const response = await fetch(url);
            return response.ok;
        } catch (error) {
            console.error('❌ Erro ao testar URL:', url, error);
            return false;
        }
    }
}