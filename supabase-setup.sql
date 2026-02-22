-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'torcedor' CHECK (role IN ('torcedor', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'geral',
  author_id UUID REFERENCES profiles(id),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published news"
  ON news FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage news"
  ON news FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active polls"
  ON polls FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage polls"
  ON polls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create poll_votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view poll votes"
  ON poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own votes"
  ON poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create match_ratings table (votação fanático)
CREATE TABLE IF NOT EXISTS match_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  player_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, user_id, player_id)
);

ALTER TABLE match_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view match ratings"
  ON match_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own ratings"
  ON match_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create comments table (resenha)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any comment"
  ON comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'torcedor'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create updated_at trigger function
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

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
