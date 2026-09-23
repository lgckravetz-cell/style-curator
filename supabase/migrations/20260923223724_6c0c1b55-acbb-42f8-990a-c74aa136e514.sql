CREATE TABLE public.usage_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('tryon', 'stylist')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.usage_reservations TO service_role;
REVOKE ALL ON public.usage_reservations FROM public, anon, authenticated;

ALTER TABLE public.usage_reservations ENABLE ROW LEVEL SECURITY;

CREATE INDEX usage_reservations_user_kind_created_idx
  ON public.usage_reservations (user_id, kind, created_at DESC);

CREATE OR REPLACE FUNCTION public.reserve_usage(
  p_user_id uuid,
  p_kind text,
  p_is_pro boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total bigint;
  v_daily bigint;
  v_monthly bigint;
  v_id uuid;
BEGIN
  IF p_kind NOT IN ('tryon', 'stylist') THEN
    RAISE EXCEPTION 'INVALID_KIND';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text || p_kind));

  SELECT
    count(*),
    count(*) FILTER (WHERE created_at >= now() - interval '24 hours'),
    count(*) FILTER (WHERE created_at >= now() - interval '30 days')
  INTO v_total, v_daily, v_monthly
  FROM public.usage_reservations
  WHERE user_id = p_user_id
    AND kind = p_kind;

  IF NOT p_is_pro THEN
    IF (p_kind = 'tryon' AND v_total >= 3)
      OR (p_kind = 'stylist' AND v_total >= 3) THEN
      RAISE EXCEPTION 'PAYWALL_REQUIRED';
    END IF;
  ELSIF p_kind = 'tryon' THEN
    IF v_daily >= 5 OR v_monthly >= 60 THEN
      RAISE EXCEPTION 'RATE_LIMIT';
    END IF;
  ELSE
    IF v_daily >= 30 OR v_monthly >= 600 THEN
      RAISE EXCEPTION 'RATE_LIMIT';
    END IF;
  END IF;

  INSERT INTO public.usage_reservations (user_id, kind)
  VALUES (p_user_id, p_kind)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reserve_usage(uuid, text, boolean) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_usage(uuid, text, boolean) TO service_role;

INSERT INTO public.usage_reservations (user_id, kind, created_at)
SELECT user_id, 'tryon', created_at
FROM public.tryon_history
WHERE status = 'success';

INSERT INTO public.usage_reservations (user_id, kind, created_at)
SELECT user_id, 'stylist', created_at
FROM public.stylist_messages
WHERE role = 'user';