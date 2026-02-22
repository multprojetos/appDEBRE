# 👑 Configuração do Usuário Admin

## Passo a Passo

### 1. Execute o SQL no Supabase

Primeiro, execute o arquivo `supabase-setup-complete.sql` no SQL Editor do Supabase (se ainda não fez).

### 2. Crie a Conta Admin no App

Acesse o app e crie uma conta com:

```
Email: admin@debreceni.com
Senha: Debre@2024!
Nome: Admin Debreceni
```

(Ou use o email/senha que preferir)

### 3. Promova para Admin

No SQL Editor do Supabase, execute:

```sql
-- Encontre o ID do usuário
SELECT id, email, name FROM profiles WHERE email = 'admin@debreceni.com';

-- Promova para admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM profiles 
WHERE email = 'admin@debreceni.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

### 4. Verifique

```sql
-- Verificar se foi promovido
SELECT 
  p.email,
  p.name,
  ur.role,
  ur.granted_at
FROM profiles p
JOIN user_roles ur ON ur.user_id = p.id
WHERE p.email = 'admin@debreceni.com';
```

Deve retornar:
```
email: admin@debreceni.com
name: Admin Debreceni
role: admin
granted_at: [timestamp]
```

### 5. Faça Login Novamente

- Faça logout no app
- Faça login com as credenciais admin
- Você verá o badge "👑 ADMINISTRADOR" no menu
- Terá acesso ao "Painel Admin"

---

## Poderes do Admin

Com a conta admin, você pode:

✅ **Gerenciar Usuários**
- Ver todos os perfis
- Promover/remover outros admins

✅ **Criar Conteúdo**
- Criar e editar notícias
- Adicionar jogadores ao elenco
- Criar jogos e atualizar placares
- Gerenciar produtos da loja

✅ **Enviar Notificações**
- Criar notificações globais
- Enviar alertas para todos os torcedores

✅ **Criar Enquetes**
- Criar enquetes para votação
- Ver resultados em tempo real

✅ **Moderar**
- Deletar comentários inadequados
- Gerenciar galeria de fotos

✅ **Ver Estatísticas**
- Ranking de torcedores
- Estatísticas de engajamento
- Votos e participação

---

## Criar Mais Admins

Para promover outro usuário a admin:

```sql
-- Substitua o email
INSERT INTO user_roles (user_id, role, granted_by)
SELECT 
  (SELECT id FROM profiles WHERE email = 'outro@email.com'),
  'admin',
  (SELECT id FROM profiles WHERE email = 'admin@debreceni.com')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## Remover Admin

Para remover privilégios de admin:

```sql
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'usuario@email.com')
AND role = 'admin';
```

---

## Credenciais Padrão Sugeridas

**Email:** admin@debreceni.com  
**Senha:** Debre@2024!

⚠️ **IMPORTANTE:** Troque a senha após o primeiro login!

---

## Troubleshooting

### "Não vejo o Painel Admin"
- Verifique se a role foi adicionada corretamente
- Faça logout e login novamente
- Limpe o cache do navegador

### "Não consigo criar notícias"
- Verifique se o RLS está ativado
- Confirme que a função `is_admin()` existe
- Execute novamente o `supabase-setup-complete.sql`

### "Erro ao promover usuário"
- Certifique-se que o usuário existe em `profiles`
- Verifique se já não é admin (conflito)
- Use `ON CONFLICT DO NOTHING` no INSERT
