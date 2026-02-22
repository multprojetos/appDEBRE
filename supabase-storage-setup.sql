-- ============================================
-- SUPABASE STORAGE SETUP
-- Configuração de buckets para upload de imagens
-- ============================================

-- ============================================
-- 1. CRIAR BUCKETS
-- ============================================

-- Bucket para avatares de usuários
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para fotos da galeria
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens de notícias
INSERT INTO storage.buckets (id, name, public)
VALUES ('news', 'news', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para fotos de jogadores
INSERT INTO storage.buckets (id, name, public)
VALUES ('players', 'players', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. POLÍTICAS DE ACESSO - AVATARS
-- ============================================

-- Qualquer um pode ver avatares
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Usuários podem fazer upload do próprio avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuários podem atualizar próprio avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuários podem deletar próprio avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 3. POLÍTICAS DE ACESSO - GALLERY
-- ============================================

-- Qualquer um pode ver galeria
CREATE POLICY "Anyone can view gallery"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Apenas admins podem fazer upload na galeria
CREATE POLICY "Admins can upload to gallery"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Apenas admins podem deletar da galeria
CREATE POLICY "Admins can delete from gallery"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- 4. POLÍTICAS DE ACESSO - NEWS
-- ============================================

-- Qualquer um pode ver imagens de notícias
CREATE POLICY "Anyone can view news images"
ON storage.objects FOR SELECT
USING (bucket_id = 'news');

-- Apenas admins podem fazer upload de imagens de notícias
CREATE POLICY "Admins can upload news images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'news' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Apenas admins podem deletar imagens de notícias
CREATE POLICY "Admins can delete news images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'news' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- 5. POLÍTICAS DE ACESSO - PRODUCTS
-- ============================================

-- Qualquer um pode ver imagens de produtos
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Apenas admins podem fazer upload de imagens de produtos
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Apenas admins podem deletar imagens de produtos
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- 6. POLÍTICAS DE ACESSO - PLAYERS
-- ============================================

-- Qualquer um pode ver fotos de jogadores
CREATE POLICY "Anyone can view player photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'players');

-- Apenas admins podem fazer upload de fotos de jogadores
CREATE POLICY "Admins can upload player photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'players' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Apenas admins podem deletar fotos de jogadores
CREATE POLICY "Admins can delete player photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'players' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- ESTRUTURA DE PASTAS RECOMENDADA
-- ============================================

-- avatars/
--   {user_id}/
--     avatar.jpg

-- gallery/
--   {match_id}/
--     photo1.jpg
--     photo2.jpg

-- news/
--   {news_id}/
--     cover.jpg
--     image1.jpg

-- products/
--   {product_id}/
--     main.jpg
--     variant1.jpg

-- players/
--   {player_id}/
--     profile.jpg
--     action.jpg

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Função para gerar URL pública do avatar
CREATE OR REPLACE FUNCTION get_avatar_url(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT 
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM storage.objects 
          WHERE bucket_id = 'avatars' 
          AND name LIKE user_id::text || '/%'
        )
        THEN (
          SELECT 'https://ipjmaedtffcyuxjswyxk.supabase.co/storage/v1/object/public/avatars/' || name
          FROM storage.objects
          WHERE bucket_id = 'avatars' 
          AND name LIKE user_id::text || '/%'
          ORDER BY created_at DESC
          LIMIT 1
        )
        ELSE NULL
      END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

-- 1. Tamanho máximo de arquivo: Configure no painel do Supabase
--    Storage > Settings > File size limit (recomendado: 5MB)

-- 2. Tipos de arquivo permitidos: Configure no painel
--    Recomendado: image/jpeg, image/png, image/webp

-- 3. URLs públicas:
--    https://ipjmaedtffcyuxjswyxk.supabase.co/storage/v1/object/public/{bucket}/{path}

-- 4. Para fazer upload no código:
--    const { data, error } = await supabase.storage
--      .from('avatars')
--      .upload(`${user.id}/avatar.jpg`, file);


-- ============================================
-- BUCKET PARA RESENHA (24H)
-- ============================================

-- Bucket para resenha (imagens e áudios temporários)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resenha', 'resenha', true)
ON CONFLICT (id) DO NOTHING;

-- Qualquer um pode ver conteúdo da resenha
CREATE POLICY "Anyone can view resenha content"
ON storage.objects FOR SELECT
USING (bucket_id = 'resenha');

-- Usuários autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload to resenha"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resenha' 
  AND auth.uid() IS NOT NULL
);

-- Usuários podem deletar próprio conteúdo
CREATE POLICY "Users can delete own resenha content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resenha' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins podem deletar qualquer conteúdo da resenha
CREATE POLICY "Admins can delete any resenha content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resenha' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
