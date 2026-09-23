-- Update tryon_history status validation to allow 'pending'
CREATE OR REPLACE FUNCTION public.validate_tryon_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('success', 'failed', 'pending') THEN
    RAISE EXCEPTION 'status inválido: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

-- Add status column to stylist_messages and validation
ALTER TABLE public.stylist_messages ADD COLUMN status TEXT NOT NULL DEFAULT 'success';

CREATE OR REPLACE FUNCTION public.validate_stylist_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('success', 'failed', 'pending') THEN
    RAISE EXCEPTION 'status inválido: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_stylist_status_trigger
BEFORE INSERT OR UPDATE ON public.stylist_messages
FOR EACH ROW EXECUTE FUNCTION public.validate_stylist_status();
