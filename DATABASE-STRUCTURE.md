# 🗄️ Estrutura Completa do Banco de Dados

## ✅ Implementação Profissional

### Resumo por Área

| Área | Tabelas | Admin pode... | Usuário pode... |
|------|---------|---------------|-----------------|
| **Auth & Perfis** | `profiles`, `user_roles` | Promover/remover admins | Ver perfis, editar próprio |
| **Notificações** | `notifications`, `notification_reads` | Criar e enviar notificações globais | Ver e marcar como lida |
| **Elenco** | `players` | CRUD completo de jogadores | Apenas visualizar |
| **Jogos** | `matches`, `standings`, `team_stats` | Criar jogos, atualizar placares e tabela | Apenas visualizar |
| **Notícias** | `news` | Criar, editar, deletar notícias | Ver notícias publicadas |
| **Loja/Manto** | `products` | Gerenciar produtos e uniformes | Ver produtos disponíveis |
| **Interação** | `fan_votes`, `polls`, `poll_votes`, `resenha_comments` | Criar enquetes, moderar comentários | Votar, comentar, participar |
| **Gamificação** | `fan_points`, `fan_ranking` (view) | Ver ranking | Ganhar pontos automaticamente |
| **Galeria** | `gallery_photos` | Upload e gerenciamento de fotos | Visualizar galeria |

---

## 📋 Detalhamento das Tabelas

### 1. AUTH & PERFIS

#### `profiles`
```sql
- id (UUID, PK)
- email (TEXT)
- name (TEXT)
- avatar_url (TEXT)
- bio (TEXT)
- created_at, updated_at
```

#### `user_roles` ⚠️ TABELA SEPARADA (SEGURANÇA)
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- role (TEXT: 'torcedor' | 'admin')
- granted_by (UUID, FK)
- granted_at (TIMESTAMP)
```

**Por que separado?**
- ✅ Segurança: Role não pode ser alterado diretamente no perfil
- ✅ Auditoria: Sabe quem concedeu a role e quando
- ✅ Múltiplas roles: Um usuário pode ter várias roles no futuro
- ✅ Função `has_role()` com SECURITY DEFINER

---

### 2. NOTIFICAÇÕES

#### `notifications`
```sql
- id, title, message
- type ('info' | 'warning' | 'success' | 'match' | 'news')
- link, icon
- created_by (admin)
- expires_at
```

#### `notification_reads`
```sql
- notification_id, user_id
- read_at
```

---

### 3. ELENCO

#### `players`
```sql
- id, name, number, position
- photo_url, birth_date, nationality
- height, weight
- status ('ativo' | 'lesionado' | 'suspenso' | 'inativo')
- bio, stats (JSONB)
```

---

### 4. JOGOS E ESTATÍSTICAS

#### `matches`
```sql
- id, home_team, away_team
- home_score, away_score
- match_date, competition, stadium
- status ('scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled')
- highlights_url, summary
```

#### `standings` (Tabela de classificação)
```sql
- competition, season, team_name
- position, played, won, drawn, lost
- goals_for, goals_against, goal_difference, points
```

#### `team_stats` (Estatísticas do jogo)
```sql
- match_id, team
- possession, shots, shots_on_target
- corners, fouls, yellow_cards, red_cards, offsides
```

---

### 5. NOTÍCIAS

#### `news`
```sql
- id, title, subtitle, content
- image_url, category
- author_id, published, featured
- views, published_at
```

---

### 6. LOJA/MANTO SAGRADO

#### `products`
```sql
- id, name, description, price
- category ('uniforme' | 'agasalho' | 'acessorio' | 'outros')
- image_url, images (JSONB array)
- sizes (JSONB), stock
- available, featured
```

---

### 7. INTERAÇÃO DO TORCEDOR

#### `fan_votes` (Votação Fanático - Craque da Partida)
```sql
- match_id, user_id, player_id
- rating (1-10)
- UNIQUE(match_id, user_id, player_id)
```

#### `polls` (Enquetes)
```sql
- id, title, description
- options (JSONB)
- active, allow_multiple
- created_by, ends_at
```

#### `poll_votes`
```sql
- poll_id, user_id, option_index
- UNIQUE(poll_id, user_id, option_index)
```

#### `resenha_comments` (Comentários dos Jogos)
```sql
- match_id, user_id, content
- parent_id (para respostas)
- likes
```

---

### 8. GAMIFICAÇÃO

#### `fan_points`
```sql
- user_id, points, action, description
- Ações: signup (+100), vote (+10), poll (+5), comment (+15)
```

#### `fan_ranking` (VIEW)
```sql
SELECT 
  user_id, name, avatar_url,
  SUM(points) as total_points,
  ROW_NUMBER() as rank
FROM profiles + fan_points
```

---

### 9. GALERIA

#### `gallery_photos`
```sql
- id, title, description
- image_url, thumbnail_url
- match_id, category
- uploaded_by, likes
```

---

## 🔒 Segurança (RLS)

### Princípios Implementados:

1. **Função `has_role()` com SECURITY DEFINER**
   - Verifica roles de forma segura
   - Não pode ser burlada pelo cliente

2. **Função `is_admin()`**
   - Wrapper para verificar se é admin
   - Usada em todas as policies

3. **Policies por Tipo:**

   **Leitura Pública:**
   - Players, matches, standings, news (publicadas), products (disponíveis)
   - Comentários, votos, galeria

   **Escrita Restrita:**
   - Usuários: Apenas seus próprios votos/comentários
   - Admins: CRUD completo em todas as tabelas de conteúdo

   **Roles:**
   - Apenas admins podem gerenciar roles
   - Todos podem ver roles (transparência)

---

## 🎯 Triggers Automáticos

### 1. `handle_new_user()`
Quando um usuário se cadastra:
- ✅ Cria perfil em `profiles`
- ✅ Atribui role 'torcedor' em `user_roles`
- ✅ Dá 100 pontos de boas-vindas

### 2. `award_points()`
Quando usuário interage:
- ✅ Vota no craque: +10 pontos
- ✅ Participa de enquete: +5 pontos
- ✅ Comenta na resenha: +15 pontos

### 3. `update_updated_at_column()`
Atualiza automaticamente `updated_at` em:
- profiles, players, matches, news, products, resenha_comments

---

## 📊 Índices para Performance

```sql
-- Roles
idx_user_roles_user_id, idx_user_roles_role

-- Notificações
idx_notifications_created_at

-- Players
idx_players_position, idx_players_status

-- Matches
idx_matches_date, idx_matches_status

-- News
idx_news_published, idx_news_category

-- Products
idx_products_category

-- Interação
idx_fan_votes_match, idx_poll_votes_poll
idx_resenha_comments_match

-- Gamificação
idx_fan_points_user

-- Galeria
idx_gallery_photos_match
```

---

## 🚀 Como Usar

### 1. Execute o SQL no Supabase
```bash
# Copie o conteúdo de supabase-setup-complete.sql
# Cole no SQL Editor do Supabase
# Execute
```

### 2. Crie o Primeiro Admin
```sql
-- Após criar sua conta no app
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'seu@email.com');
```

### 3. Teste as Permissões
```typescript
// No código
const { isAdmin } = useAuth();

if (isAdmin) {
  // Criar notícia
  await supabase.from('news').insert({ ... });
}

// Qualquer usuário pode votar
await supabase.from('fan_votes').insert({
  match_id: '...',
  user_id: user.id,
  player_id: '...',
  rating: 10
});
```

---

## ✅ Diferenças da Implementação Básica

| Aspecto | Básico | Profissional |
|---------|--------|--------------|
| **Roles** | Campo no perfil | Tabela separada + SECURITY DEFINER |
| **Segurança** | Policies simples | Função `has_role()` + auditoria |
| **Tabelas** | 5 tabelas | 15 tabelas + 1 view |
| **Gamificação** | Não tinha | Sistema completo de pontos |
| **Notificações** | Não tinha | Sistema push com leitura |
| **Galeria** | Não tinha | Upload e categorização |
| **Estatísticas** | Não tinha | Stats completas dos jogos |
| **Produtos** | Não tinha | Loja completa |
| **Triggers** | 2 triggers | 7 triggers automáticos |
| **Índices** | Nenhum | 15 índices |

---

## 📝 Próximos Passos

1. ✅ Execute `supabase-setup-complete.sql`
2. ✅ Crie seu primeiro admin
3. ⏳ Configure Supabase Storage para imagens
4. ⏳ Implemente as páginas conectadas ao banco
5. ⏳ Configure notificações push
6. ⏳ Adicione upload de fotos na galeria
