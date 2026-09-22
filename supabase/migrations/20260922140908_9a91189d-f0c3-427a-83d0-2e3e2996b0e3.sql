ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE POLICY "tryon_objects_select_own" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'tryon' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "tryon_objects_insert_own" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'tryon' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "tryon_objects_update_own" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'tryon' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'tryon' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "tryon_objects_delete_own" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'tryon' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE INDEX IF NOT EXISTS tryon_history_user_created_idx ON public.tryon_history (user_id, created_at DESC);