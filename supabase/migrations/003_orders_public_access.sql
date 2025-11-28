-- Allow public viewing of completed gifts
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'Public can view ready orders'
  ) then
    create policy "Public can view ready orders"
      on public.orders
      for select
      to anon, authenticated
      using (status = 'ready');
  end if;
end $$;
