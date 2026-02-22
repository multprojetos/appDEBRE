# Setup do Projeto Debreceni App

## 1. Configuração do Supabase

### Criar as tabelas no banco de dados:

1. Acesse o painel do Supabase: https://ipjmaedtffcyuxjswyxk.supabase.co
2. Vá em "SQL Editor"
3. Copie e cole o conteúdo do arquivo `supabase-setup.sql`
4. Execute o script

### Criar o primeiro usuário admin:

Após criar sua conta no app, execute no SQL Editor:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';
```

## 2. Variáveis de Ambiente

O arquivo `.env.local` já está configurado com as credenciais do Supabase.

**IMPORTANTE**: Adicione `.env.local` ao `.gitignore` para não expor as credenciais.

## 3. Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 4. Deploy na Vercel

### Configuração:

1. Conecte o repositório GitHub na Vercel
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`: https://ipjmaedtffcyuxjswyxk.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: (sua chave anon)

3. Deploy automático será feito a cada push na branch main

### PWA:

O app já está configurado como PWA. Após o deploy:
- Usuários podem instalar o app no celular
- Funciona offline com cache
- Ícone na tela inicial

## 5. Funcionalidades Implementadas

### Autenticação:
- ✅ Login/Cadastro de torcedores
- ✅ Perfis de usuário (torcedor/admin)
- ✅ Proteção de rotas
- ✅ Logout

### Banco de Dados:
- ✅ Tabela de perfis
- ✅ Tabela de notícias
- ✅ Tabela de enquetes
- ✅ Tabela de votações (craque da partida)
- ✅ Tabela de comentários (resenha)
- ✅ Row Level Security (RLS) configurado

### PWA:
- ✅ Manifest configurado
- ✅ Service Worker
- ✅ Cache offline
- ✅ Instalável

## 6. Próximos Passos

- Implementar upload de imagens (Supabase Storage)
- Conectar as páginas com o banco de dados
- Adicionar notificações push
- Melhorar os ícones do PWA (substituir placeholder.svg)
