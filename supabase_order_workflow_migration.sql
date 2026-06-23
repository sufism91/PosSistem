
-- Run this in Supabase SQL Editor before using the new workflow.
alter table public.customer_orders add column if not exists order_status text default 'pending_confirmation';
alter table public.customer_orders add column if not exists confirmed_at timestamptz;
alter table public.customer_orders add column if not exists confirmed_by text;
alter table public.customer_orders add column if not exists paid_at timestamptz;
alter table public.customer_orders add column if not exists payment_method text;
alter table public.drink_options add column if not exists image_url text;
update public.customer_orders set order_status = coalesce(order_status, status, 'pending_confirmation') where order_status is null;
create index if not exists idx_customer_orders_status on public.customer_orders(status);
create index if not exists idx_customer_orders_payment_status on public.customer_orders(payment_status);
create index if not exists idx_customer_orders_order_status on public.customer_orders(order_status);
