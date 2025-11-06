-- Créer la table card_lists
CREATE TABLE card_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table cards
CREATE TABLE cards (
  id SERIAL PRIMARY KEY,
  list_id UUID REFERENCES card_lists(id) ON DELETE CASCADE,
  recto TEXT NOT NULL,
  title TEXT NOT NULL,
  img TEXT,
  color TEXT,
  recurrence INTEGER DEFAULT 0,
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer les index pour améliorer les performances
CREATE INDEX idx_cards_list_id ON cards(list_id);
CREATE INDEX idx_card_lists_user_id ON card_lists(user_id);

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE card_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Policies pour card_lists
CREATE POLICY "Users can view their own lists"
  ON card_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lists"
  ON card_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
  ON card_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
  ON card_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour cards
CREATE POLICY "Users can view cards from their lists"
  ON cards FOR SELECT
  USING (
    list_id IN (
      SELECT id FROM card_lists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cards in their lists"
  ON cards FOR INSERT
  WITH CHECK (
    list_id IN (
      SELECT id FROM card_lists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in their lists"
  ON cards FOR UPDATE
  USING (
    list_id IN (
      SELECT id FROM card_lists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards from their lists"
  ON cards FOR DELETE
  USING (
    list_id IN (
      SELECT id FROM card_lists WHERE user_id = auth.uid()
    )
  );