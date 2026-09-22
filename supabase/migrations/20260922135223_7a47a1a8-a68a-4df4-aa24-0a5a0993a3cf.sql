-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT,
  estilo TEXT,
  coloracao_pessoal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- wardrobe_items
CREATE TABLE public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  categoria TEXT NOT NULL DEFAULT 'indefinido',
  subcategoria TEXT,
  cor TEXT,
  material TEXT,
  image_url TEXT NOT NULL,
  confianca NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wardrobe_items_user_id_idx ON public.wardrobe_items (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wardrobe_items TO authenticated;
GRANT ALL ON public.wardrobe_items TO service_role;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wardrobe_select_own" ON public.wardrobe_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wardrobe_insert_own" ON public.wardrobe_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wardrobe_update_own" ON public.wardrobe_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wardrobe_delete_own" ON public.wardrobe_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- outfits
CREATE TABLE public.outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  item_ids UUID[] NOT NULL DEFAULT '{}',
  ocasiao TEXT,
  score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX outfits_user_id_idx ON public.outfits (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outfits TO authenticated;
GRANT ALL ON public.outfits TO service_role;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "outfits_select_own" ON public.outfits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "outfits_insert_own" ON public.outfits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "outfits_update_own" ON public.outfits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "outfits_delete_own" ON public.outfits FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- tryon_history
CREATE TABLE public.tryon_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  wardrobe_item_id UUID REFERENCES public.wardrobe_items (id) ON DELETE SET NULL,
  result_image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX tryon_history_user_id_idx ON public.tryon_history (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tryon_history TO authenticated;
GRANT ALL ON public.tryon_history TO service_role;
ALTER TABLE public.tryon_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tryon_select_own" ON public.tryon_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "tryon_insert_own" ON public.tryon_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tryon_update_own" ON public.tryon_history FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tryon_delete_own" ON public.tryon_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- status válido via trigger (regra dependente de dados)
CREATE OR REPLACE FUNCTION public.validate_tryon_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('success', 'failed') THEN
    RAISE EXCEPTION 'status inválido: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER validate_tryon_status_trg BEFORE INSERT OR UPDATE ON public.tryon_history
FOR EACH ROW EXECUTE FUNCTION public.validate_tryon_status();

-- updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER wardrobe_items_updated_at BEFORE UPDATE ON public.wardrobe_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER outfits_updated_at BEFORE UPDATE ON public.outfits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- cria perfil automaticamente no primeiro acesso
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();