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
  CONSTRAINT attendance_logs_servant_id_fkey FOREIGN KEY (servant_id) REFERENCES public.servants(id),
  CONSTRAINT attendance_logs_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id)
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
  mobile_personal text,
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
  CONSTRAINT points_transactions_servant_id_fkey FOREIGN KEY (servant_id) REFERENCES public.servants(id),
  CONSTRAINT points_transactions_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id)
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