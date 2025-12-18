// src/services/upload.ts - VERSÃO COMPLETA CORRIGIDA
import { supabase } from "../lib/supabase";

// Detectar ambiente
const IS_WEB = typeof window !== 'undefined' &&
    (typeof navigator !== 'undefined' && navigator.product !== 'ReactNative');
const IS_REACT_NATIVE = !IS_WEB;

// Importação condicional do expo-image-picker
let ImagePicker: any = null;
if (IS_REACT_NATIVE) {
    try {
        ImagePicker = require('expo-image-picker');
    } catch (error) {
        console.warn('expo-image-picker não disponível (ambiente Web?)');
    }
}

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export class UploadService {
    private static readonly AVATAR_BUCKET = 'avatars';
    private static readonly GESTOS_BUCKET = 'gestos';

    private static showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;

    static setToastHandler(handler: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void) {
        this.showToast = handler;
    }

    private static showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
        if (this.showToast) {
            this.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // ============================================
    // MÉTODOS DE SELEÇÃO DE IMAGEM
    // ============================================

    static async pickImageFromGallery(): Promise<string | null> {
        try {
            if (IS_REACT_NATIVE && ImagePicker) {
                // React Native com Expo
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                
                if (status !== 'granted') {
                    this.showAlert('Precisamos de permissão para acessar sua galeria de fotos.', 'warning');
                    return null;
                }

                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });

                if (result.canceled || !result.assets?.[0]) {
                    return null;
                }

                return result.assets[0].uri;
            } else {
                // Ambiente Web - MODIFICADO para retornar base64
                return new Promise((resolve) => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.style.display = 'none';

                    input.onchange = async (event: Event) => {
                        const target = event.target as HTMLInputElement;
                        const file = target.files?.[0];

                        if (!file) {
                            resolve(null);
                            return;
                        }

                        // CONVERTER IMEDIATAMENTE PARA BASE64
                        try {
                            const base64Data = await this.fileToBase64(file);
                            resolve(base64Data);
                        } catch (error) {
                            console.error('Erro ao converter para base64:', error);
                            // Fallback: cria blob URL temporária
                            const blobUrl = URL.createObjectURL(file);
                            resolve(blobUrl);
                        }

                        // Remover input do DOM
                        setTimeout(() => {
                            if (document.body.contains(input)) {
                                document.body.removeChild(input);
                            }
                        }, 100);
                    };

                    input.oncancel = () => {
                        resolve(null);
                        setTimeout(() => {
                            if (document.body.contains(input)) {
                                document.body.removeChild(input);
                            }
                        }, 100);
                    };

                    document.body.appendChild(input);
                    input.click();
                });
            }
        } catch (error: any) {
            console.error('Erro ao selecionar imagem:', error);
            this.showAlert('Erro ao selecionar imagem. Tente novamente.', 'error');
            return null;
        }
    }

    static async takePhotoWithCamera(): Promise<string | null> {
        try {
            if (IS_REACT_NATIVE && ImagePicker) {
                // React Native com Expo
                const { status } = await ImagePicker.requestCameraPermissionsAsync();

                if (status !== 'granted') {
                    this.showAlert('Precisamos de permissão para acessar sua câmera.', 'warning');
                    return null;
                }

                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });

                if (result.canceled || !result.assets?.[0]) {
                    return null;
                }

                return result.assets[0].uri;
            } else {
                // Ambiente Web - câmera
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    this.showAlert('Câmera não suportada neste navegador.', 'warning');
                    return null;
                }

                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'user' }
                    });

                    const video = document.createElement('video');
                    video.srcObject = stream;
                    await video.play();

                    return new Promise((resolve) => {
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');

                        video.onloadedmetadata = () => {
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;

                            setTimeout(() => {
                                if (context) {
                                    context.drawImage(video, 0, 0);

                                    stream.getTracks().forEach(track => track.stop());

                                    canvas.toBlob((blob) => {
                                        if (blob) {
                                            // Converter blob para base64
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                resolve(reader.result as string);
                                            };
                                            reader.onerror = () => {
                                                const blobUrl = URL.createObjectURL(blob);
                                                resolve(blobUrl);
                                            };
                                            reader.readAsDataURL(blob);
                                        } else {
                                            resolve(null);
                                        }
                                    }, 'image/jpeg', 0.8);
                                } else {
                                    resolve(null);
                                }
                            }, 500);
                        };
                    });
                } catch (error: any) {
                    console.warn('Erro ao acessar câmera:', error);
                    this.showAlert('Não foi possível acessar a câmera.', 'warning');
                    return null;
                }
            }
        } catch (error: any) {
            console.error('Erro ao tirar foto:', error);
            this.showAlert('Erro ao tirar foto. Tente novamente.', 'error');
            return null;
        }
    }

    // ============================================
    // MÉTODOS DE CONVERSÃO
    // ============================================

    static async blobUrlToBase64(blobUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!blobUrl.startsWith('blob:')) {
                reject(new Error('Não é uma URL blob'));
                return;
            }

            fetch(blobUrl)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();

                    reader.onloadend = () => {
                        const base64data = reader.result as string;
                        // Libera a URL blob para evitar memory leak
                        URL.revokeObjectURL(blobUrl);
                        resolve(base64data);
                    };

                    reader.onerror = () => {
                        reject(new Error('Erro ao ler blob'));
                    };

                    reader.readAsDataURL(blob);
                })
                .catch(error => reject(error));
        });
    }

    static fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const result = reader.result as string;
                resolve(result);
            };

            reader.onerror = () => {
                reject(new Error('Erro ao ler arquivo'));
            };

            reader.readAsDataURL(file);
        });
    }

    static blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    private static base64ToUint8Array(base64Data: string): Uint8Array {
        const matches = base64Data.match(/^data:(image\/\w+);base64,/);
        if (!matches) {
            throw new Error('Formato base64 inválido');
        }

        const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
        const binaryString = atob(base64String);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return bytes;
    }

    private static getMimeTypeFromBase64(base64Data: string): string {
        const matches = base64Data.match(/^data:(image\/\w+);base64,/);
        return matches ? matches[1] : 'image/jpeg';
    }

    // ============================================
    // MÉTODO DE UPLOAD PRINCIPAL - COMPLETO
    // ============================================

    static async uploadAvatar(userId: string, imageUri: string): Promise<UploadResult> {
        try {
            console.log('🚀 Upload iniciado para usuário:', userId);
            console.log('📱 Tipo de URI:', imageUri.substring(0, 50));

            let fileData: Uint8Array | Blob | File;
            let contentType = 'image/jpeg';

            // ============================================
            // DETECTAR E PROCESSAR DIFERENTES TIPOS DE URI
            // ============================================

            // 1. BLOB URL (Web)
            if (imageUri.startsWith('blob:')) {
                console.log('🌐 Processando blob URL...');
                try {
                    // Tentar converter blob URL para base64
                    const base64Data = await this.blobUrlToBase64(imageUri);
                    fileData = this.base64ToUint8Array(base64Data);
                    contentType = this.getMimeTypeFromBase64(base64Data);
                    console.log(`✅ Blob convertido para base64: ${contentType}`);
                } catch (conversionError: any) {
                    console.error('❌ Erro ao converter blob:', conversionError);
                    // Fallback: tentar fetch normal
                    try {
                        const response = await fetch(imageUri);
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        const blob = await response.blob();
                        fileData = blob;
                        contentType = blob.type || 'image/jpeg';
                    } catch (fallbackError: any) {
                        throw new Error(`Falha ao processar blob: ${fallbackError.message}`);
                    }
                }
            }
            // 2. DATA URL (base64) - PREFERIDO
            else if (imageUri.startsWith('data:')) {
                console.log('🔢 Processando data URL (preferido)...');
                try {
                    fileData = this.base64ToUint8Array(imageUri);
                    contentType = this.getMimeTypeFromBase64(imageUri);
                    console.log(`✅ Base64 processado: ${contentType}, tamanho: ${fileData.length} bytes`);
                } catch (error: any) {
                    throw new Error(`Erro ao processar data URL: ${error.message}`);
                }
            }
            // 3. URI LOCAL (React Native)
            else if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
                console.log('📱 Processando URI local do React Native...');
                try {
                    // Em React Native, podemos enviar a URI diretamente
                    // O Supabase para React Native aceita URIs locais
                    const response = await fetch(imageUri);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    const blob = await response.blob();
                    fileData = blob;
                    contentType = blob.type || 'image/jpeg';
                } catch (error: any) {
                    throw new Error(`Erro ao carregar imagem local: ${error.message}`);
                }
            }
            // 4. URL HTTP/HTTPS (remota)
            else if (imageUri.startsWith('http')) {
                console.log('🔗 Processando URL remota...');
                try {
                    const response = await fetch(imageUri);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    const blob = await response.blob();
                    fileData = blob;
                    contentType = blob.type || 'image/jpeg';
                } catch (error: any) {
                    throw new Error(`Erro ao carregar URL remota: ${error.message}`);
                }
            }
            // 5. Tipo desconhecido
            else {
                throw new Error(`Tipo de URI não suportado: ${imageUri.substring(0, 50)}`);
            }

            // ============================================
            // FAZER UPLOAD PARA O SUPABASE
            // ============================================

            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 10);
            const extension = contentType.split('/')[1] || 'jpg';
            const fileName = `${userId}/upload_${timestamp}_${random}.${extension}`;
            
            console.log(`📁 Nome do arquivo: ${fileName}`);
            console.log(`📤 Tipo: ${contentType}`);
            console.log(`📦 Tamanho:`, fileData instanceof Blob ? `${fileData.size} bytes (Blob)` : `${fileData.length} bytes (Uint8Array)`);

            const { error } = await supabase.storage
                .from(this.AVATAR_BUCKET)
                .upload(fileName, fileData, {
                    contentType: contentType,
                    upsert: true,
                });

            if (error) {
                console.error('❌ Erro no upload:', error);
                this.showAlert('Erro ao fazer upload da imagem.', 'error');
                return { success: false, error: error.message };
            }

            const { data: { publicUrl } } = supabase.storage
                .from(this.AVATAR_BUCKET)
                .getPublicUrl(fileName);

            console.log('✅ Upload concluído! URL:', publicUrl);
            
            // Se era blob URL e ainda não liberamos, liberar agora
            if (imageUri.startsWith('blob:')) {
                try {
                    URL.revokeObjectURL(imageUri);
                    console.log('🗑️ Blob URL liberada da memória');
                } catch (e) {
                    // Ignorar erro ao liberar
                }
            }
            
            this.showAlert('Upload realizado com sucesso!', 'success');
            
            return {
                success: true,
                url: publicUrl
            };

        } catch (error: any) {
            console.error('💥 Erro no upload:', error);
            
            // Tentar liberar blob URL em caso de erro
            if (imageUri.startsWith('blob:')) {
                try {
                    URL.revokeObjectURL(imageUri);
                } catch (e) {
                    // Ignorar
                }
            }
            
            this.showAlert('Erro ao fazer upload da imagem. Tente novamente.', 'error');
            
            return {
                success: false,
                error: error.message || 'Erro desconhecido no upload'
            };
        }
    }

    // ============================================
    // MÉTODOS DE CONVENIÊNCIA
    // ============================================

    static async uploadGestoImage(userId: string, imageUri: string, gestoId?: number): Promise<UploadResult> {
        try {
            console.log('🎭 Upload de gesto iniciado...');
            
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
    static async uploadAvatarSimple(userId: string, imageUri: string): Promise<UploadResult> {
        return this.uploadAvatar(userId, imageUri);
    }

    static async uploadGestoImagem(userId: string, imageUri: string, gestoId?: number): Promise<UploadResult> {
        return this.uploadGestoImage(userId, imageUri, gestoId);
    }

    // ============================================
    // MÉTODOS DE UTILIDADE
    // ============================================

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

    static getAvatarUrl(avatarUrl?: string, userId?: string, size: number = 200): string {
        if (avatarUrl) {
            const timestamp = Date.now();
            const separator = avatarUrl.includes('?') ? '&' : '?';
            return `${avatarUrl}${separator}t=${timestamp}`;
        }

        const name = userId ? encodeURIComponent(userId.substring(0, 8)) : 'U';
        return `https://ui-avatars.com/api/?name=${name}&background=8BC5E5&color=fff&bold=true&size=${size}`;
    }

    static getGestoImagemUrl(imagemUrl?: string): string | undefined {
        if (!imagemUrl) return undefined;
        const timestamp = Date.now();
        const separator = imagemUrl.includes('?') ? '&' : '?';
        return `${imagemUrl}${separator}t=${timestamp}`;
    }

    // Método para converter qualquer URI para base64 (útil para Web)
    static async ensureBase64(imageUri: string): Promise<string> {
        // Se já for base64, retorna como está
        if (imageUri.startsWith('data:')) {
            return imageUri;
        }

        // Se for blob URL, converte
        if (imageUri.startsWith('blob:')) {
            return await this.blobUrlToBase64(imageUri);
        }

        // Para outros tipos, tenta converter via fetch
        const response = await fetch(imageUri);
        const blob = await response.blob();
        return await this.blobToBase64(blob);
    }

    // Método para Web - upload direto de File
    static async uploadFile(userId: string, file: File, bucket: string = this.AVATAR_BUCKET): Promise<UploadResult> {
        try {
            console.log('📤 Upload direto de File...');

            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 10);
            const extension = file.name.split('.').pop() || 'jpg';
            const fileName = `${userId}/file_${timestamp}_${random}.${extension}`;

            const { error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, {
                    contentType: file.type || 'image/jpeg',
                    upsert: true,
                });

            if (error) {
                console.error('❌ Erro no upload:', error);
                this.showAlert('Erro ao fazer upload do arquivo.', 'error');
                return { success: false, error: error.message };
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            console.log('✅ Upload direto concluído!');
            
            return {
                success: true,
                url: publicUrl
            };

        } catch (error: any) {
            console.error('💥 Erro no upload direto:', error);
            this.showAlert('Erro ao fazer upload do arquivo. Tente novamente.', 'error');
            return {
                success: false,
                error: error.message || 'Erro no upload'
            };
        }
    }

    // Método para limpar URLs blob
    static revokeBlobUrl(url: string): void {
        if (url.startsWith('blob:')) {
            try {
                URL.revokeObjectURL(url);
            } catch (e) {
                // Ignorar erro
            }
        }
    }
}