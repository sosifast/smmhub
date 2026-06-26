----------------------------------------------------
-- API LOGS TABLE DEFINITION
----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID REFERENCES public.user(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for faster querying by user or endpoint
CREATE INDEX IF NOT EXISTS idx_api_logs_id_user ON public.api_logs(id_user);
CREATE INDEX IF NOT EXISTS idx_api_logs_create_at ON public.api_logs(create_at);

ALTER TABLE public.api_logs DISABLE ROW LEVEL SECURITY;
