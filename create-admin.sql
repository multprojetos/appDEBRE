-- ============================================
-- CRIAR USUÁRIO ADMIN PADRÃO
-- ============================================

-- IMPORTANTE: Execute este script APÓS criar o usuário no app
-- ou use o painel do Supabase para criar o usuário primeiro

-- Opção 1: Se você já criou uma conta no app, promova para admin
-- Substitua 'admin@debreceni.com' pelo email que você usou

UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'admin@debreceni.com'
);

-- Se o usuário não tiver role ainda, insira:
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM profiles 
WHERE email = 'admin@debreceni.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- VERIFICAR SE O ADMIN FOI CRIADO
-- ============================================

SELECT 
  p.id,
  p.email,
  p.name,
  ur.role,
  ur.granted_at
FROM profiles p
JOIN user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'admin';

-- ============================================
-- CREDENCIAIS SUGERIDAS PARA O ADMIN
-- ============================================

-- Email: admin@debreceni.com
-- Senha: Debre@2024! (ou a que você preferir)

-- PASSOS:
-- 1. Crie a conta no app com essas credenciais
-- 2. Execute o UPDATE acima para promover a admin
-- 3. Faça logout e login novamente
-- 4. Você terá acesso total ao painel admin!
