----------------------------------------------------
-- DATA_SERVER TABLE DEFINITION
----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.data_server (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    supabase_link TEXT NOT NULL,
    supabase_anonkey TEXT NOT NULL,
    supabase_other JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Not-Active')),
    create_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.data_server DISABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER set_data_server_update_at
    BEFORE UPDATE ON public.data_server
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_update_timestamp();
