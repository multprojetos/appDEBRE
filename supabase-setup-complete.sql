-- ============================================
-- DEBRECENI APP - COMPLETE DATABASE SETUP
-- ============================================

-- ============================================
-- 1. AUTH & PERFIS
-- ============================================

-- Profiles table (public info only)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles (SEPARATE TABLE for security)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('torcedor', 'admin')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Security function to check roles (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = $1 AND user_roles.role = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN has_role(user_id, 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. NOTIFICAÇÕES
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'match', 'news')),
  link TEXT,
  icon TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- ============================================
-- 3. ELENCO
-- ============================================

CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  number INTEGER,
  position TEXT NOT NULL CHECK (position IN ('Goleiro', 'Zagueiro', 'Lateral', 'Meio-campo', 'Atacante')),
  photo_url TEXT,
  birth_date DATE,
  nationality TEXT,
  height DECIMAL(3,2),
  weight DECIMAL(5,2),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'lesionado', 'suspenso', 'inativo')),
  bio TEXT,
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. JOGOS E ESTATÍSTICAS
-- ============================================

CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  competition TEXT NOT NULL,
  stadium TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'postponed', 'cancelled')),
  highlights_url TEXT,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS standings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition TEXT NOT NULL,
  season TEXT NOT NULL,
  team_name TEXT NOT NULL,
  position INTEGER NOT NULL,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(competition, season, team_name)
);

CREATE TABLE IF NOT EXISTS team_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  team TEXT NOT NULL,
  possession DECIMAL(5,2),
  shots INTEGER DEFAULT 0,
  shots_on_target INTEGER DEFAULT 0,
  corners INTEGER DEFAULT 0,
  fouls INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  offsides INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. NOTÍCIAS
-- ============================================

CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'geral' CHECK (category IN ('geral', 'jogo', 'elenco', 'bastidores', 'torcida')),
  author_id UUID REFERENCES profiles(id),
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 6. LOJA/MANTO SAGRADO
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('uniforme', 'agasalho', 'acessorio', 'outros')),
  image_url TEXT,
  images JSONB DEFAULT '[]',
  sizes JSONB DEFAULT '[]',
  stock INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. INTERAÇÃO DO TORCEDOR
-- ============================================

-- Votação Fanático (craque da partida)
CREATE TABLE IF NOT EXISTS fan_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, user_id, player_id)
);

-- Enquetes
CREATE TABLE IF NOT EXISTS polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  allow_multiple BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id, option_index)
);

-- Resenha (comentários dos jogos)
CREATE TABLE IF NOT EXISTS resenha_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES resenha_comments(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. GAMIFICAÇÃO
-- ============================================

CREATE TABLE IF NOT EXISTS fan_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- View para ranking
CREATE OR REPLACE VIEW fan_ranking AS
SELECT 
  p.id,
  p.name,
  p.avatar_url,
  COALESCE(SUM(fp.points), 0) as total_points,
  COUNT(DISTINCT fp.id) as total_actions,
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(fp.points), 0) DESC) as rank
FROM profiles p
LEFT JOIN fan_points fp ON fp.user_id = p.id
GROUP BY p.id, p.name, p.avatar_url
ORDER BY total_points DESC;

-- ============================================
-- 9. GALERIA
-- ============================================

CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  category TEXT CHECK (category IN ('jogo', 'treino', 'bastidores', 'torcida', 'evento')),
  uploaded_by UUID REFERENCES profiles(id),
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenha_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- USER_ROLES POLICIES
-- ============================================

CREATE POLICY "Anyone can view roles"
  ON user_roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON user_roles FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

CREATE POLICY "Anyone can view active notifications"
  ON notifications FOR SELECT
  USING (expires_at IS NULL OR expires_at > NOW());

CREATE POLICY "Admins can manage notifications"
  ON notifications FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can mark notifications as read"
  ON notification_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their notification reads"
  ON notification_reads FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- PLAYERS POLICIES
-- ============================================

CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage players"
  ON players FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- MATCHES POLICIES
-- ============================================

CREATE POLICY "Anyone can view matches"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage matches"
  ON matches FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view standings"
  ON standings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage standings"
  ON standings FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view team stats"
  ON team_stats FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage team stats"
  ON team_stats FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- NEWS POLICIES
-- ============================================

CREATE POLICY "Anyone can view published news"
  ON news FOR SELECT
  USING (published = true OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage news"
  ON news FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  USING (available = true OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- FAN INTERACTION POLICIES
-- ============================================

CREATE POLICY "Anyone can view fan votes"
  ON fan_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own votes"
  ON fan_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active polls"
  ON polls FOR SELECT
  USING (active = true OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage polls"
  ON polls FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view poll votes"
  ON poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own poll votes"
  ON poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments"
  ON resenha_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON resenha_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON resenha_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON resenha_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any comment"
  ON resenha_comments FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- GAMIFICATION POLICIES
-- ============================================

CREATE POLICY "Anyone can view fan points"
  ON fan_points FOR SELECT
  USING (true);

CREATE POLICY "System can insert points"
  ON fan_points FOR INSERT
  WITH CHECK (true);

-- ============================================
-- GALLERY POLICIES
-- ============================================

CREATE POLICY "Anyone can view gallery photos"
  ON gallery_photos FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage gallery"
  ON gallery_photos FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'torcedor');
  
  -- Give welcome points
  INSERT INTO public.fan_points (user_id, points, action, description)
  VALUES (NEW.id, 100, 'signup', 'Boas-vindas ao Debreceni App!');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resenha_comments_updated_at
  BEFORE UPDATE ON resenha_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to award points for actions
CREATE OR REPLACE FUNCTION award_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Award points based on action
  IF TG_TABLE_NAME = 'fan_votes' THEN
    INSERT INTO fan_points (user_id, points, action, description)
    VALUES (NEW.user_id, 10, 'vote', 'Votou no craque da partida');
  ELSIF TG_TABLE_NAME = 'poll_votes' THEN
    INSERT INTO fan_points (user_id, points, action, description)
    VALUES (NEW.user_id, 5, 'poll', 'Participou de uma enquete');
  ELSIF TG_TABLE_NAME = 'resenha_comments' THEN
    INSERT INTO fan_points (user_id, points, action, description)
    VALUES (NEW.user_id, 15, 'comment', 'Comentou na resenha');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for gamification
CREATE TRIGGER award_points_on_vote
  AFTER INSERT ON fan_votes
  FOR EACH ROW EXECUTE FUNCTION award_points();

CREATE TRIGGER award_points_on_poll_vote
  AFTER INSERT ON poll_votes
  FOR EACH ROW EXECUTE FUNCTION award_points();

CREATE TRIGGER award_points_on_comment
  AFTER INSERT ON resenha_comments
  FOR EACH ROW EXECUTE FUNCTION award_points();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_matches_date ON matches(match_date DESC);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_news_published ON news(published, created_at DESC);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_fan_votes_match ON fan_votes(match_id);
CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_resenha_comments_match ON resenha_comments(match_id);
CREATE INDEX idx_fan_points_user ON fan_points(user_id);
CREATE INDEX idx_gallery_photos_match ON gallery_photos(match_id);

-- ============================================
-- INITIAL DATA (OPTIONAL)
-- ============================================

-- You can add initial data here if needed
-- Example: INSERT INTO players (name, position, number) VALUES ('Player Name', 'Atacante', 10);


-- ============================================
-- ATUALIZAÇÃO: RESENHA COM MÍDIA E EXPIRAÇÃO
-- ============================================

-- Adicionar colunas para mídia e expiração
ALTER TABLE resenha_comments 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'audio')),
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS audio_duration INTEGER,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours');

-- Criar índice para expiração
CREATE INDEX IF NOT EXISTS idx_resenha_expires ON resenha_comments(expires_at);

-- Função para limpar posts expirados automaticamente
CREATE OR REPLACE FUNCTION cleanup_expired_resenha()
RETURNS void AS $$
BEGIN
  -- Deletar posts expirados
  DELETE FROM resenha_comments
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Você pode agendar esta função para rodar periodicamente
-- ou chamá-la manualmente quando necessário
