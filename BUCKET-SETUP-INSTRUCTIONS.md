# 🔧 CORREÇÃO: Bucket Not Found

## ❌ Erro Atual

Ao tentar enviar imagem ou áudio na resenha, aparece:
```
bucket not found
```

## ✅ SOLUÇÃO

### Opção 1: Criar Bucket Manualmente (RECOMENDADO)

1. **Acesse o Supabase:**
   - https://ipjmaedtffcyuxjswyxk.supabase.co

2. **Vá em Storage:**
   - Menu lateral > Storage

3. **Crie o bucket `resenha`:**
   - Clique em "New bucket"
   - Nome: `resenha`
   - Public: ✅ SIM (marque como público)
   - Clique em "Create bucket"

4. **Configure as políticas:**
   - Vá na aba "Policies" do bucket
   - Clique em "New Policy"
   - Use o template "Allow public read access"
   - Adicione também políticas de upload para usuários autenticados

### Opção 2: Executar SQL (AUTOMÁTICO)

Execute este SQL no SQL Editor do Supabase:

```sql
-- Criar bucket resenha
INSERT INTO storage.buckets (id, name, public)
VALUES ('resenha', 'resenha', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso
CREATE POLICY "Anyone can view resenha content"
ON storage.objects FOR SELECT
USING (bucket_id = 'resenha');

CREATE POLICY "Authenticated users can upload to resenha"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resenha' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete own resenha content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resenha' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Opção 3: Criar Todos os Buckets de Uma Vez

Execute o arquivo `supabase-storage-setup.sql` completo no SQL Editor.

---

## 📋 Checklist de Buckets Necessários

Execute este SQL para verificar quais buckets existem:

```sql
SELECT * FROM storage.buckets;
```

**Buckets necessários:**
- [ ] `avatars` - Fotos de perfil
- [ ] `gallery` - Galeria de fotos
- [ ] `news` - Imagens de notícias
- [ ] `products` - Imagens de produtos
- [ ] `players` - Fotos de jogadores
- [ ] `resenha` - Imagens e áudios da resenha (24h)

**Para criar todos de uma vez:**

```sql
-- Criar todos os buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('gallery', 'gallery', true),
  ('news', 'news', true),
  ('products', 'products', true),
  ('players', 'players', true),
  ('resenha', 'resenha', true)
ON CONFLICT (id) DO NOTHING;
```

---

## 🧪 Testar se Funcionou

Após criar o bucket, teste:

1. Acesse a Resenha do Debre
2. Clique no botão +
3. Escolha "Foto" ou "Áudio"
4. Tente fazer upload
5. Deve funcionar! ✅

---

## 🔍 Troubleshooting

### Erro persiste?

1. **Verifique se o bucket foi criado:**
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'resenha';
   ```

2. **Verifique as políticas:**
   ```sql
   SELECT * FROM storage.policies WHERE bucket_id = 'resenha';
   ```

3. **Verifique se está autenticado:**
   - Faça logout e login novamente
   - Verifique se o token está válido

4. **Limpe o cache:**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

---

## ✅ Após Corrigir

O upload de imagens e áudios na resenha funcionará normalmente:
- ✅ Upload de imagens (até 5MB)
- ✅ Gravação de áudio
- ✅ Expiração automática em 24h
- ✅ Download disponível para todos
