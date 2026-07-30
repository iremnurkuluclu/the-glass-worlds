alter table public.messages enable row level security;

create policy "Anyone can send a contact message"
on public.messages for insert to anon, authenticated
with check (true);

create policy "Only the admin can read contact messages"
on public.messages for select to authenticated
using ((auth.jwt() ->> 'email') = 'nirem587@gmail.com');
