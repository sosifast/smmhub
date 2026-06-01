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
