# 📦 Configuração do Supabase Storage

## Upload de Imagens - Guia Completo

### 1. Executar Script SQL

No SQL Editor do Supabase, execute:

```bash
# Cole o conteúdo de supabase-storage-setup.sql
# Execute
```

Isso vai criar:
- ✅ 5 buckets públicos (avatars, gallery, news, products, players)
- ✅ Políticas de segurança (RLS)
- ✅ Permissões corretas por role

---

## 📁 Buckets Criados

### 1. **avatars** (Avatares de Usuários)
- **Quem pode fazer upload:** Qualquer usuário (apenas seu próprio avatar)
- **Quem pode ver:** Todos
- **Estrutura:** `avatars/{user_id}/avatar.jpg`

### 2. **gallery** (Galeria de Fotos)
- **Quem pode fazer upload:** Apenas admins
- **Quem pode ver:** Todos
- **Estrutura:** `gallery/{match_id}/photo1.jpg`

### 3. **news** (Imagens de Notícias)
- **Quem pode fazer upload:** Apenas admins
- **Quem pode ver:** Todos
- **Estrutura:** `news/{news_id}/cover.jpg`

### 4. **products** (Imagens de Produtos)
- **Quem pode fazer upload:** Apenas admins
- **Quem pode ver:** Todos
- **Estrutura:** `products/{product_id}/main.jpg`

### 5. **players** (Fotos de Jogadores)
- **Quem pode fazer upload:** Apenas admins
- **Quem pode ver:** Todos
- **Estrutura:** `players/{player_id}/profile.jpg`

---

## 🔒 Segurança Implementada

### Avatares (Usuários)
```sql
✅ Usuário pode fazer upload apenas do próprio avatar
✅ Usuário pode atualizar apenas o próprio avatar
✅ Usuário pode deletar apenas o próprio avatar
✅ Todos podem visualizar avatares
```

### Conteúdo Admin (gallery, news, products, players)
```sql
✅ Apenas admins podem fazer upload
✅ Apenas admins podem deletar
✅ Todos podem visualizar
```

---

## 💻 Como Usar no Código

### Upload de Avatar (Qualquer Usuário)

```typescript
import { uploadAvatar } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

function ProfileEdit() {
  const { user } = useAuth();

  const handleAvatarUpload = async (file: File) => {
    try {
      const url = await uploadAvatar(user.id, file);
      toast.success('Avatar atualizado!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <input 
      type="file" 
      accept="image/*"
      onChange={(e) => handleAvatarUpload(e.target.files[0])}
    />
  );
}
```

### Upload de Foto na Galeria (Admin)

```typescript
import { uploadGalleryPhoto } from '@/lib/storage';

const handleGalleryUpload = async (file: File) => {
  try {
    const photo = await uploadGalleryPhoto(file, {
      title: 'Título da foto',
      description: 'Descrição',
      match_id: 'uuid-do-jogo',
      category: 'jogo',
      uploaded_by: user.id
    });
    toast.success('Foto adicionada à galeria!');
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Upload de Imagem de Notícia (Admin)

```typescript
import { uploadNewsImage } from '@/lib/storage';

const handleNewsImageUpload = async (file: File) => {
  try {
    const url = await uploadNewsImage(file, newsId);
    // Usar a URL na notícia
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

## 🎯 Validações Automáticas

Todas as funções de upload validam:

✅ **Tipo de arquivo:** Apenas JPG, PNG, WEBP
✅ **Tamanho:** Máximo 5MB
✅ **Permissões:** Verifica se o usuário pode fazer upload
✅ **Duplicatas:** Remove avatar antigo ao fazer upload de novo

---

## 🌐 URLs Públicas

Formato das URLs:
```
https://ipjmaedtffcyuxjswyxk.supabase.co/storage/v1/object/public/{bucket}/{path}
```

Exemplos:
```
Avatar:
https://ipjmaedtffcyuxjswyxk.supabase.co/storage/v1/object/public/avatars/user-id/avatar.jpg

Galeria:
https://ipjmaedtffcyuxjswyxk.supabase.co/storage/v1/object/public/gallery/match-id/photo1.jpg
```

---

## ⚙️ Configurações Recomendadas no Painel

### 1. Tamanho Máximo de Arquivo
```
Storage > Settings > File size limit: 5MB
```

### 2. Tipos de Arquivo Permitidos
```
Storage > Buckets > [bucket] > Settings
Allowed MIME types: image/jpeg, image/png, image/webp
```

### 3. Cache
```
Cache-Control: public, max-age=3600
```

---

## 📊 Resumo de Permissões

| Bucket | Upload | Delete | View |
|--------|--------|--------|------|
| avatars | Próprio usuário | Próprio usuário | Todos |
| gallery | Admin | Admin | Todos |
| news | Admin | Admin | Todos |
| products | Admin | Admin | Todos |
| players | Admin | Admin | Todos |

---

## ✅ Checklist de Setup

- [ ] Executar `supabase-storage-setup.sql`
- [ ] Verificar buckets criados no painel
- [ ] Configurar tamanho máximo (5MB)
- [ ] Configurar tipos permitidos (JPG, PNG, WEBP)
- [ ] Testar upload de avatar (usuário)
- [ ] Testar upload de galeria (admin)
- [ ] Verificar URLs públicas funcionando

---

## 🚀 Próximos Passos

1. Implementar componente de upload de avatar no perfil
2. Criar página de gerenciamento de galeria (admin)
3. Adicionar upload de imagens no formulário de notícias
4. Implementar upload de fotos de jogadores
5. Adicionar upload de imagens de produtos

---

**Storage configurado e pronto para uso!** 📸
