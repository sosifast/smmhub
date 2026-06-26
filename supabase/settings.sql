----------------------------------------------------
-- SETTINGS TABLE DEFINITION
----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name VARCHAR(255),
    favicon TEXT,
    logo TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    telegram VARCHAR(255),
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    create_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER set_settings_update_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_update_timestamp();

-- Opsional: Insert default value
-- INSERT INTO public.settings (site_name, email) VALUES ('SMM Hub', 'admin@smmhub.com');
