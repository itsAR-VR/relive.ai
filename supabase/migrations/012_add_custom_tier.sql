-- =============================================
-- Add 'custom' tier + normalize biography tier
-- =============================================

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'orders'
  ) then
    -- Drop existing tier check constraint (commonly named orders_tier_check)
    begin
      alter table public.orders drop constraint if exists orders_tier_check;
    exception when others then
      -- ignore
    end;

    -- Normalize any legacy values
    update public.orders set tier = 'biography' where tier = 'bio';

    -- Re-add with the new tier included
    alter table public.orders
      add constraint orders_tier_check
      check (tier in ('standard', 'premium', 'biography', 'custom'));
  end if;
end $$;

