-- Fix Security Definer Views
-- This migration updates views to use security_invoker = true, 
-- which ensures that Row Level Security (RLS) policies on underlying tables 
-- are respected for the user querying the view.

ALTER VIEW public.payment_summary SET (security_invoker = true);
ALTER VIEW public.client_analytics SET (security_invoker = true);
ALTER VIEW public.pending_tasks SET (security_invoker = true);
ALTER VIEW public.upcoming_travels SET (security_invoker = true);
