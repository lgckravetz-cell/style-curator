CREATE TABLE public.stylist_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL DEFAULT '',
  has_image BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stylist_messages TO authenticated;
GRANT ALL ON public.stylist_messages TO service_role;

ALTER TABLE public.stylist_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stylist_messages_select_own" ON public.stylist_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "stylist_messages_insert_own" ON public.stylist_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stylist_messages_update_own" ON public.stylist_messages FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stylist_messages_delete_own" ON public.stylist_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX stylist_messages_user_created_idx ON public.stylist_messages (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.validate_stylist_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.role NOT IN ('user', 'assistant') THEN
    RAISE EXCEPTION 'role inválido: %', NEW.role;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_stylist_role_trigger
BEFORE INSERT OR UPDATE ON public.stylist_messages
FOR EACH ROW EXECUTE FUNCTION public.validate_stylist_role();