-- Enable RLS (безопасно, если уже включено)
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Читать могут все клиенты
DO $$ BEGIN
  CREATE POLICY deals_select_public
  ON public.deals
  FOR SELECT
  TO anon, authenticated
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Вставлять временно разрешаем всем клиентам (для MVP/хакатона)
DO $$ BEGIN
  CREATE POLICY deals_insert_public
  ON public.deals
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
