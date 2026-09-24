-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text,
  gender text,
  educational_stage text,
  birth_date date,
  class_or_job text,
  father_of_confession text,
  mobile_personal text,
  mobile_father text,
  mobile_mother text,
  address_area text,
  address_details text,
  points_balance integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  photo_url text,
  academic_year text,
  participant_id text UNIQUE,
  CONSTRAINT participants_pkey PRIMARY KEY (id)
);
CREATE TABLE public.attendance_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  scanned_at timestamp with time zone DEFAULT now(),
  servant_id uuid,
  attendance_date date DEFAULT CURRENT_DATE,
  CONSTRAINT attendance_logs_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_logs_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id),
  CONSTRAINT attendance_logs_servant_id_fkey FOREIGN KEY (servant_id) REFERENCES public.servants(id)
);
CREATE TABLE public.servants (
  created_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text,
  gender text,
  educational_stage text,
  academic_year text,
  class_or_job text,
  birth_date date,
  father_of_confession text,
  mobile_personal text UNIQUE,
  address_area text,
  address_details text,
  photo_url text,
  role text,
  class_stage text,
  teacher_id text NOT NULL UNIQUE,
  status text DEFAULT 'approved'::text,
  CONSTRAINT servants_pkey PRIMARY KEY (id),
  CONSTRAINT servants_auth_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.areas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT areas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.points_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  participant_id uuid,
  servant_id uuid,
  transaction_type text,
  points_amount integer,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT points_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT points_transactions_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id),
  CONSTRAINT points_transactions_servant_id_fkey FOREIGN KEY (servant_id) REFERENCES public.servants(id)
);
CREATE TABLE public.financial_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text,
  title text,
  amount integer,
  transaction_date date DEFAULT CURRENT_DATE,
  education_stage text,
  person_name text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  servant_id uuid,
  CONSTRAINT financial_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT financial_transactions_servant_id_fkey FOREIGN KEY (servant_id) REFERENCES public.servants(id)
);
CREATE TABLE public.servant_attendance_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  servant_id uuid NOT NULL,
  scanned_by uuid,
  meeting_type text NOT NULL CHECK (meeting_type = ANY (ARRAY['class'::text, 'service_meeting'::text])),
  attendance_date date DEFAULT CURRENT_DATE,
  scanned_at timestamp with time zone DEFAULT now(),
  CONSTRAINT servant_attendance_logs_pkey PRIMARY KEY (id),
  CONSTRAINT servant_attendance_logs_servant_id_fkey FOREIGN KEY (servant_id) REFERENCES public.servants(id),
  CONSTRAINT servant_attendance_logs_scanned_by_fkey FOREIGN KEY (scanned_by) REFERENCES public.servants(id)
);

CREATE OR REPLACE FUNCTION public.delete_servant_completely(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Remove servant attendance logs
  DELETE FROM public.servant_attendance_logs WHERE servant_id = target_user_id OR scanned_by = target_user_id;
  
  -- 2. Nullify references in attendance and points ledgers
  UPDATE public.attendance_logs SET servant_id = NULL WHERE servant_id = target_user_id;
  UPDATE public.points_transactions SET servant_id = NULL WHERE servant_id = target_user_id;
  UPDATE public.financial_transactions SET servant_id = NULL WHERE servant_id = target_user_id;
  
  -- 3. Remove servant profile record
  DELETE FROM public.servants WHERE id = target_user_id;
  
  -- 4. Delete Supabase Auth user
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;