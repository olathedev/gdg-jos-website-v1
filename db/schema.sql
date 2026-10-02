-- DevFest Jos 2026 ticketing. Safe to run more than once (npm run db:migrate).

create extension if not exists pgcrypto;

create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null unique,              -- Paystack reference (or FREE-… for Regular)
  tier          text not null check (tier in ('regular', 'vip', 'padi')),
  units         int  not null check (units > 0),
  amount_kobo   int  not null check (amount_kobo >= 0),
  currency      text not null default 'NGN',
  status        text not null default 'pending'
                check (status in ('pending', 'paid', 'free', 'failed')),
  buyer_name    text not null,
  buyer_email   text not null,
  buyer_phone   text,
  attendees     jsonb not null,                    -- [{ name, email }] captured at checkout
  paystack      jsonb,                             -- verified transaction payload
  failure       text,
  created_at    timestamptz not null default now(),
  paid_at       timestamptz,
  emailed_at    timestamptz
);

create index if not exists orders_status_idx on orders (status);
create index if not exists orders_buyer_email_idx on orders (lower(buyer_email));

create table if not exists tickets (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,             -- shown on the ticket and in the QR code
  order_id       uuid not null references orders (id) on delete cascade,
  tier           text not null,
  holder_name    text not null,
  holder_email   text not null,
  checked_in_at  timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists tickets_order_idx on tickets (order_id);

-- One free (Regular) ticket per email address.
create unique index if not exists tickets_one_regular_per_email
  on tickets (lower(holder_email)) where tier = 'regular';
