-- AI Document Generator setup for Tenant Prospect CRM.
-- Run this in Supabase SQL Editor for project dnmfqcjownhzngjdngdi before enabling live document generation.
-- Keep both Storage buckets private. Generated files should be downloaded through signed URLs.

create table if not exists public.document_templates (
  id uuid primary key default gen_random_uuid(),
  document_type text not null check (document_type in ('quotation', 'letter_of_offer', 'lease_agreement')),
  template_name text not null,
  storage_path text not null,
  version integer not null default 1 check (version > 0),
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists document_templates_one_active_per_type
  on public.document_templates (document_type)
  where is_active;

create index if not exists document_templates_type_active_idx
  on public.document_templates (document_type, is_active);

create table if not exists public.document_requests (
  id uuid primary key default gen_random_uuid(),
  document_type text not null check (document_type in ('quotation', 'letter_of_offer', 'lease_agreement')),
  status text not null default 'draft' check (
    status in (
      'draft',
      'ai_review_required',
      'missing_information',
      'ready_to_generate',
      'generated',
      'revision_requested',
      'approved',
      'sent',
      'cancelled'
    )
  ),
  client_id uuid,
  unit_id uuid,
  requested_by uuid references auth.users(id) default auth.uid(),
  source_type text not null default 'structured_form' check (
    source_type in ('structured_form', 'ai_request', 'existing_letter_of_offer', 'direct_terms_input', 'revision')
  ),
  original_request_text text,
  source_data jsonb not null default '{}'::jsonb,
  ai_extracted_data jsonb not null default '{}'::jsonb,
  approved_data jsonb not null default '{}'::jsonb,
  missing_fields jsonb not null default '[]'::jsonb,
  risk_flags jsonb not null default '[]'::jsonb,
  latest_version_number integer not null default 0 check (latest_version_number >= 0),
  latest_file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists document_requests_status_idx
  on public.document_requests (status, updated_at desc);

create index if not exists document_requests_type_idx
  on public.document_requests (document_type, updated_at desc);

create index if not exists document_requests_requested_by_idx
  on public.document_requests (requested_by, updated_at desc);

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_request_id uuid not null references public.document_requests(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  file_path text not null,
  structured_data jsonb not null default '{}'::jsonb,
  change_summary text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid(),
  unique (document_request_id, version_number)
);

create index if not exists document_versions_request_idx
  on public.document_versions (document_request_id, version_number desc);

create table if not exists public.revision_requests (
  id uuid primary key default gen_random_uuid(),
  document_request_id uuid not null references public.document_requests(id) on delete restrict,
  document_version_id uuid references public.document_versions(id) on delete set null,
  instruction text not null,
  ai_proposed_changes jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'ai_review_required', 'accepted', 'generated', 'cancelled')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid()
);

create index if not exists revision_requests_document_request_idx
  on public.revision_requests (document_request_id, created_at desc);

create table if not exists public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  document_request_id uuid references public.document_requests(id) on delete set null,
  interaction_type text not null,
  input_text text not null default '',
  ai_output jsonb not null default '{}'::jsonb,
  model_name text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid()
);

create index if not exists ai_interactions_document_request_idx
  on public.ai_interactions (document_request_id, created_at desc);

create or replace function public.set_document_generator_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_document_templates_updated_at on public.document_templates;
create trigger set_document_templates_updated_at
before update on public.document_templates
for each row execute function public.set_document_generator_updated_at();

drop trigger if exists set_document_requests_updated_at on public.document_requests;
create trigger set_document_requests_updated_at
before update on public.document_requests
for each row execute function public.set_document_generator_updated_at();

alter table public.document_templates enable row level security;
alter table public.document_requests enable row level security;
alter table public.document_versions enable row level security;
alter table public.revision_requests enable row level security;
alter table public.ai_interactions enable row level security;

grant select, insert, update on public.document_templates to authenticated;
grant select, insert, update on public.document_requests to authenticated;
grant select, insert on public.document_versions to authenticated;
grant select, insert, update on public.revision_requests to authenticated;
grant select, insert on public.ai_interactions to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'document_templates' and policyname = 'Active staff can read document templates'
  ) then
    create policy "Active staff can read document templates"
      on public.document_templates for select
      to authenticated
      using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true
      ));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'document_templates' and policyname = 'Admins can manage document templates'
  ) then
    create policy "Admins can manage document templates"
      on public.document_templates for all
      to authenticated
      using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true and profiles.role = 'admin'
      ))
      with check (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true and profiles.role = 'admin'
      ));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'document_requests' and policyname = 'Active staff can read document requests'
  ) then
    create policy "Active staff can read document requests"
      on public.document_requests for select
      to authenticated
      using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true
      ));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'document_requests' and policyname = 'Active staff can create document requests'
  ) then
    create policy "Active staff can create document requests"
      on public.document_requests for insert
      to authenticated
      with check (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true
      ));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'document_requests' and policyname = 'Active staff can update document requests'
  ) then
    create policy "Active staff can update document requests"
      on public.document_requests for update
      to authenticated
      using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true
      ))
      with check (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true
      ));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'document_versions' and policyname = 'Active staff can read document versions'
  ) then
    create policy "Active staff can read document versions"
      on public.document_versions for select
      to authenticated
      using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true
      ));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'document_versions' and policyname = 'Active staff can create document versions'
  ) then
    create policy "Active staff can create document versions"
      on public.document_versions for insert
      to authenticated
      with check (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true
      ));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'revision_requests' and policyname = 'Active staff can read revision requests'
  ) then
    create policy "Active staff can read revision requests"
      on public.revision_requests for select
      to authenticated
      using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true
      ));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'revision_requests' and policyname = 'Active staff can create revision requests'
  ) then
    create policy "Active staff can create revision requests"
      on public.revision_requests for insert
      to authenticated
      with check (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true
      ));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'revision_requests' and policyname = 'Active staff can update revision requests'
  ) then
    create policy "Active staff can update revision requests"
      on public.revision_requests for update
      to authenticated
      using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true
      ))
      with check (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true
      ));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ai_interactions' and policyname = 'Active staff can read AI interactions'
  ) then
    create policy "Active staff can read AI interactions"
      on public.ai_interactions for select
      to authenticated
      using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true
      ));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ai_interactions' and policyname = 'Active staff can create AI interactions'
  ) then
    create policy "Active staff can create AI interactions"
      on public.ai_interactions for insert
      to authenticated
      with check (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.active = true
      ));
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('document-templates', 'document-templates', false, 10485760),
  ('generated-documents', 'generated-documents', false, 20971520)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Active staff can read document storage'
  ) then
    create policy "Active staff can read document storage"
      on storage.objects for select
      to authenticated
      using (
        bucket_id in ('document-templates', 'generated-documents')
        and exists (
          select 1 from public.profiles
          where profiles.id = (select auth.uid()) and profiles.active = true
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can manage document templates in storage'
  ) then
    create policy "Admins can manage document templates in storage"
      on storage.objects for all
      to authenticated
      using (
        bucket_id = 'document-templates'
        and exists (
          select 1 from public.profiles
          where profiles.id = (select auth.uid()) and profiles.active = true and profiles.role = 'admin'
        )
      )
      with check (
        bucket_id = 'document-templates'
        and exists (
          select 1 from public.profiles
          where profiles.id = (select auth.uid()) and profiles.active = true and profiles.role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Active staff can create generated documents'
  ) then
    create policy "Active staff can create generated documents"
      on storage.objects for insert
      to authenticated
      with check (
        bucket_id = 'generated-documents'
        and exists (
          select 1 from public.profiles
          where profiles.id = (select auth.uid()) and profiles.active = true
        )
      );
  end if;
end $$;

comment on table public.document_templates is
  'Active Word templates for the AI Document Generator. Upload .docx files to the private document-templates bucket and register their storage_path here.';

comment on table public.document_requests is
  'Staff-created document requests. AI output is draft support only; approved_data is the human-confirmed source used for generation.';

comment on column public.document_requests.approved_data is
  'Human-confirmed structured data. Do not generate a Word document from ai_extracted_data alone.';

comment on table public.document_versions is
  'Immutable generated document versions. Do not delete previous versions during normal CRM use.';

comment on table public.ai_interactions is
  'Audit log for AI classification, extraction, missing-information checks, risk flags, and revisions.';

-- Template placeholders expected by the generator include:
-- {{client_name}}, {{tenant_name}}, {{unit_number}}, {{booking_dates}}, {{price}},
-- {{rental_structure}}, {{lease_term}}, {{commencement_date}}, {{expiry_date}},
-- {{security_deposit}}, {{permitted_use}}, {{service_charge}}, {{gst_treatment}},
-- {{rent_free_period}}, {{fitting_out_period}}, {{handover_condition}},
-- {{option_to_renew}}, and {{special_conditions}}.
