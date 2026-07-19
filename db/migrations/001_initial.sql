begin;

create table if not exists public.shipreceipt_evidence (
  id uuid primary key,
  evidence jsonb not null,
  evidence_root text not null check (evidence_root ~ '^0x[0-9a-fA-F]{64}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.shipreceipt_receipts (
  receipt_id text primary key check (receipt_id ~ '^[0-9]+$'),
  evidence_id uuid not null references public.shipreceipt_evidence(id),
  transaction_hash text not null check (transaction_hash ~ '^0x[0-9a-fA-F]{64}$'),
  contract_address text not null check (contract_address ~ '^0x[0-9a-fA-F]{40}$'),
  created_at timestamptz not null default now()
);

revoke create on schema public from shipreceipt_runtime;
revoke all privileges on table public.shipreceipt_evidence from shipreceipt_runtime;
revoke all privileges on table public.shipreceipt_receipts from shipreceipt_runtime;

grant connect on database shipreceipt to shipreceipt_runtime;
grant usage on schema public to shipreceipt_runtime;
grant select, insert on table public.shipreceipt_evidence to shipreceipt_runtime;
grant select, insert, update on table public.shipreceipt_receipts to shipreceipt_runtime;

commit;
