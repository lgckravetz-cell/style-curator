DROP FUNCTION public.reserve_usage(uuid, text, boolean);

CREATE OR REPLACE FUNCTION public.reserve_usage(
  p_user_id uuid,
  p_kind text,
  p_total_limit integer,
  p_daily_limit integer,
  p_monthly_limit integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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

  IF p_total_limit IS NOT NULL AND v_total >= p_total_limit THEN
    RAISE EXCEPTION 'PAYWALL_REQUIRED';
  END IF;

  IF p_daily_limit IS NOT NULL AND v_daily >= p_daily_limit THEN
    RAISE EXCEPTION 'RATE_LIMIT_DAILY';
  END IF;

  IF p_monthly_limit IS NOT NULL AND v_monthly >= p_monthly_limit THEN
    RAISE EXCEPTION 'RATE_LIMIT_MONTHLY';
  END IF;

  INSERT INTO public.usage_reservations (user_id, kind)
  VALUES (p_user_id, p_kind)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.reserve_usage(uuid, text, integer, integer, integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_usage(uuid, text, integer, integer, integer) TO service_role;