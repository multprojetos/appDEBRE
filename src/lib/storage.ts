import { supabase } from './supabase';

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  GALLERY: 'gallery',
  NEWS: 'news',
  PRODUCTS: 'products',
  PLAYERS: 'players',
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/**
 * Upload avatar do usuário
 */
export async function uploadAvatar(userId: string, file: File) {
  // Validar tipo de arquivo
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WEBP.');
  }

  // Validar tamanho
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Arquivo muito grande. Máximo 5MB.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  // Deletar avatar antigo se existir
  const { data: existingFiles } = await supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .list(userId);

  if (existingFiles && existingFiles.length > 0) {
    await supabase.storage
      .from(STORAGE_BUCKETS.AVATARS)
      .remove(existingFiles.map(f => `${userId}/${f.name}`));
  }

  // Upload novo avatar
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .getPublicUrl(fileName);

  // Atualizar perfil com nova URL
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);

  return publicUrl;
}

/**
 * Upload de foto para galeria (apenas admin)
 */
export async function uploadGalleryPhoto(file: File, metadata: {
  title: string;
  description?: string;
  match_id?: string;
  category?: string;
  uploaded_by: string;
}) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WEBP.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Arquivo muito grande. Máximo 5MB.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = metadata.match_id 
    ? `${metadata.match_id}/${fileName}`
    : `general/${fileName}`;

  // Upload
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.GALLERY)
    .upload(filePath, file);

  if (error) throw error;

  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS.GALLERY)
    .getPublicUrl(filePath);

  // Criar registro na tabela gallery_photos
  const { data: photoData, error: dbError } = await supabase
    .from('gallery_photos')
    .insert({
      title: metadata.title,
      description: metadata.description,
      image_url: publicUrl,
      match_id: metadata.match_id,
      category: metadata.category,
      uploaded_by: metadata.uploaded_by,
    })
    .select()
    .single();

  if (dbError) throw dbError;

  return photoData;
}

/**
 * Upload de imagem de notícia (apenas admin)
 */
export async function uploadNewsImage(file: File, newsId?: string) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WEBP.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Arquivo muito grande. Máximo 5MB.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = newsId ? `${newsId}/${fileName}` : `temp/${fileName}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.NEWS)
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS.NEWS)
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Upload de imagem de produto (apenas admin)
 */
export async function uploadProductImage(file: File, productId?: string) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WEBP.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Arquivo muito grande. Máximo 5MB.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = productId ? `${productId}/${fileName}` : `temp/${fileName}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.PRODUCTS)
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS.PRODUCTS)
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Upload de foto de jogador (apenas admin)
 */
export async function uploadPlayerPhoto(file: File, playerId?: string) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WEBP.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Arquivo muito grande. Máximo 5MB.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = playerId ? `${playerId}/${fileName}` : `temp/${fileName}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.PLAYERS)
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS.PLAYERS)
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Deletar arquivo do storage
 */
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}

/**
 * Obter URL pública de um arquivo
 */
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}
