-- SQL Schema Definition for Supabase (PostgreSQL)
-- This script sets up the "user" and "api_key" tables, check constraints for level and status, 
-- and automatic "update_at" triggers.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

----------------------------------------------------
-- 1. USER TABLE DEFINITION
----------------------------------------------------

-- OPTION A: Standalone public.user table
-- (Use this if you are managing user credentials manually)
CREATE TABLE IF NOT EXISTS public.user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Hashed password
    level VARCHAR(20) NOT NULL DEFAULT 'Member' CHECK (level IN ('Admin', 'Member')),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Not-Active')),
    create_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- OPTION B (Commented out): Integrated with Supabase Auth
-- (Supabase best practice: links public.user to auth.users)
/*
CREATE TABLE IF NOT EXISTS public.user (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    level VARCHAR(20) NOT NULL DEFAULT 'Member' CHECK (level IN ('Admin', 'Member')),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Not-Active')),
    create_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
*/

----------------------------------------------------
-- 2. API_KEY TABLE DEFINITION
----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.api_key (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    api_key TEXT,
    api_id TEXT,
    secret_key TEXT,
    url TEXT,
    balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Not-Active')),
    create_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

----------------------------------------------------
-- 3. AUTOMATIC UPDATE_AT TRIGGER FUNCTIONS
----------------------------------------------------

-- Function to handle update_at column modification timestamp
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user table
CREATE OR REPLACE TRIGGER set_user_update_at
    BEFORE UPDATE ON public.user
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_update_timestamp();

-- Trigger for api_key table
CREATE OR REPLACE TRIGGER set_api_key_update_at
    BEFORE UPDATE ON public.api_key
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_update_timestamp();

----------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) CONFIGURATION
----------------------------------------------------

-- QUICK FIX FOR DEVELOPMENT: Disable RLS on both tables so the client can query directly
ALTER TABLE public.user DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key DISABLE ROW LEVEL SECURITY;

-- RECOMMENDED PRODUCTION FIX (If keeping RLS enabled):
-- Enable RLS and create permissive policies:
/*
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key ENABLE ROW LEVEL SECURITY;

-- User Policies:
-- Allow anyone (anon) to insert a new user (registration)
CREATE POLICY "Allow public registration" ON public.user 
    FOR INSERT WITH CHECK (true);

-- Allow anyone to read user details for login verification
CREATE POLICY "Allow read for auth check" ON public.user 
    FOR SELECT USING (true);

-- Allow full modifications on user details
CREATE POLICY "Allow full user access" ON public.user 
    FOR ALL USING (true);

-- API Key Policies:
-- Allow full access to api_keys
CREATE POLICY "Allow full api_key access" ON public.api_key 
    FOR ALL USING (true) WITH CHECK (true);
*/

----------------------------------------------------
-- 5. SESSION TABLE DEFINITION
----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    session_data JSONB, -- JSON representation of session metadata (e.g. User Agent, IP, Device)
    status VARCHAR(20) NOT NULL DEFAULT 'Login' CHECK (status IN ('Login', 'Logout')),
    expired_at TIMESTAMP WITH TIME ZONE NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Quick fix for development: disable RLS on session table
ALTER TABLE public.session DISABLE ROW LEVEL SECURITY;

-- Trigger to auto-update update_at column
CREATE OR REPLACE TRIGGER set_session_update_at
    BEFORE UPDATE ON public.session
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_update_timestamp();

----------------------------------------------------
-- 6. PAKET_SMM TABLE DEFINITION
----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.paket_smm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_paket TEXT NOT NULL,
    durasi INTEGER NOT NULL,
    "desc" JSONB,
    total_link INTEGER NOT NULL,
    backup_server BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Not-Active')),
    price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
    curency VARCHAR(5) NOT NULL DEFAULT 'IDR' CHECK (curency IN ('IDR', 'USD')),
    create_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.paket_smm DISABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER set_paket_smm_update_at
    BEFORE UPDATE ON public.paket_smm
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_update_timestamp();

----------------------------------------------------
-- 7. PAYMENT_GATEWAY TABLE DEFINITION
----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.payment_gateway (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('Cryptomus', 'Tripay')),
    mode VARCHAR(20) NOT NULL DEFAULT 'Sandbox' CHECK (mode IN ('Sandbox', 'Production')),
    api_config JSONB,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.payment_gateway DISABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER set_payment_gateway_update_at
    BEFORE UPDATE ON public.payment_gateway
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_update_timestamp();

----------------------------------------------------
-- 8. LANGGANAN_SMM TABLE DEFINITION
----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.langganan_smm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_users UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    id_paket_smm UUID NOT NULL REFERENCES public.paket_smm(id) ON DELETE CASCADE,
    id_payment_gateway UUID NOT NULL REFERENCES public.payment_gateway(id) ON DELETE CASCADE,
    detail_transaction JSONB,
    status_payment VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status_payment IN ('Pending', 'Error', 'Expired', 'Success')),
    create_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.langganan_smm DISABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER set_langganan_smm_update_at
    BEFORE UPDATE ON public.langganan_smm
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_update_timestamp();

