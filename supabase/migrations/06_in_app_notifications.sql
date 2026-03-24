-- Migration: In-App Notification System
-- Date: 2026-03-24
-- Description: Create a table for real-time dashboard notifications for fundraisers. bono.

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'donation', 'milestone', 'update_prompt', 'system'
    text TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role/System can insert notifications
-- (Implicitly allowed for the system if no restrictive insert policy exists, 
-- but we add an admin/system policy for clarity)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Add update trigger for updated_at
DROP TRIGGER IF EXISTS tr_notifications_updated_at ON public.notifications;
CREATE TRIGGER tr_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Automations Logic (In-App)
-- This function can be called to detect if a fundraiser needs a nudge
CREATE OR REPLACE FUNCTION public.check_fundraiser_nudges(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    r_camp RECORD;
BEGIN
    -- 1. Check for "Update Nudge" (No update in 3 days)
    FOR r_camp IN 
        SELECT id, title, last_update_at 
        FROM public.campaigns 
        WHERE user_id = p_user_id AND status = 'live' 
        AND (last_update_at < (NOW() - INTERVAL '3 days') OR last_update_at IS NULL)
    LOOP
        -- Insert notification if not exists in the last 24h
        IF NOT EXISTS (
            SELECT 1 FROM public.notifications 
            WHERE user_id = p_user_id 
            AND type = 'update_prompt' 
            AND text LIKE '%' || r_camp.title || '%'
            AND created_at > (NOW() - INTERVAL '24 hours')
        ) THEN
            INSERT INTO public.notifications (user_id, type, text, link)
            VALUES (p_user_id, 'update_prompt', 'It''s been 3 days since your last update for ' || r_camp.title || '. Post one to keep donors engaged! bono.', '/dashboard/campaigns/' || r_camp.id || '/update');
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
