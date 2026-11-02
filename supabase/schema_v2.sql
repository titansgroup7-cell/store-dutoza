-- =====================================================================
-- STORE DUTOZA - schema v2
-- Approval ya masasisho, notifications, customer care, push.
-- Endesha kwenye Supabase -> SQL Editor (salama kurudia).
-- =====================================================================

-- ---------- 0. Helpers ----------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

alter table public.apps add column if not exists admin_note text;
alter table public.apps add column if not exists whats_new text;

-- ---------- 1. Tables ----------
-- app_updates: maombi ya developer kubadilisha app (yanasubiri admin)
do $$
declare cat_type text;
begin
  select format_type(atttypid, atttypmod) into cat_type
  from pg_attribute
  where attrelid = 'public.apps'::regclass and attname = 'category_id' and not attisdropped;
  if cat_type is null then cat_type := 'uuid'; end if;

  execute format($f$
    create table if not exists public.app_updates (
      id uuid primary key default gen_random_uuid(),
      app_id uuid not null references public.apps(id) on delete cascade,
      developer_id uuid not null references public.profiles(id) on delete cascade,
      name text,
      short_description text,
      description text,
      package_name text,
      version_name text,
      version_code int,
      category_id %s,
      apk_url text,
      apk_size bigint,
      icon_url text,
      screenshots jsonb,
      change_notes text,
      status text not null default 'pending' check (status in ('pending','approved','rejected')),
      admin_note text,
      reviewed_by uuid,
      reviewed_at timestamptz,
      created_at timestamptz not null default now()
    )$f$, cat_type);
end $$;

create index if not exists app_updates_status_idx on public.app_updates(status, created_at);
create index if not exists app_updates_app_idx on public.app_updates(app_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'info',
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, is_read, created_at desc);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  status text not null default 'open' check (status in ('open','answered','closed')),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
create index if not exists support_tickets_user_idx on public.support_tickets(user_id, last_message_at desc);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  is_staff boolean not null default false,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists support_messages_ticket_idx on public.support_messages(ticket_id, created_at);

-- ---------- 2. RLS ----------
alter table public.app_updates enable row level security;
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

-- app_updates
drop policy if exists "au_select" on public.app_updates;
create policy "au_select" on public.app_updates for select
  using (developer_id = auth.uid() or public.is_admin());
drop policy if exists "au_insert" on public.app_updates;
create policy "au_insert" on public.app_updates for insert
  with check (
    developer_id = auth.uid()
    and status = 'pending'
    and exists (select 1 from public.apps a where a.id = app_id and a.developer_id = auth.uid() and a.status <> 'blocked')
  );
drop policy if exists "au_delete" on public.app_updates;
create policy "au_delete" on public.app_updates for delete
  using ((developer_id = auth.uid() and status = 'pending') or public.is_admin());

-- notifications (kila mtu anaona zake tu; kuingiza ni kwa triggers/functions tu)
drop policy if exists "n_select" on public.notifications;
create policy "n_select" on public.notifications for select using (user_id = auth.uid());
drop policy if exists "n_update" on public.notifications;
create policy "n_update" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "n_delete" on public.notifications;
create policy "n_delete" on public.notifications for delete using (user_id = auth.uid());

-- push_subscriptions
drop policy if exists "ps_select" on public.push_subscriptions;
create policy "ps_select" on public.push_subscriptions for select using (user_id = auth.uid());

-- support
drop policy if exists "st_select" on public.support_tickets;
create policy "st_select" on public.support_tickets for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "st_insert" on public.support_tickets;
create policy "st_insert" on public.support_tickets for insert with check (user_id = auth.uid());
drop policy if exists "st_update" on public.support_tickets;
create policy "st_update" on public.support_tickets for update using (user_id = auth.uid() or public.is_admin());

drop policy if exists "sm_select" on public.support_messages;
create policy "sm_select" on public.support_messages for select using (
  exists (select 1 from public.support_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or public.is_admin()))
);
drop policy if exists "sm_insert" on public.support_messages;
create policy "sm_insert" on public.support_messages for insert with check (
  sender_id = auth.uid()
  and (
    (is_staff = false and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()))
    or (is_staff = true and public.is_admin())
  )
);

-- ---------- 3. Push subscription RPCs ----------
create or replace function public.register_push_subscription(p_endpoint text, p_p256dh text, p_auth text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Ingia kwanza'; end if;
  insert into public.push_subscriptions(user_id, endpoint, p256dh, auth)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth)
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth;
end $$;

create or replace function public.remove_push_subscription(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from public.push_subscriptions where endpoint = p_endpoint and user_id = auth.uid();
$$;

grant execute on function public.register_push_subscription(text, text, text) to authenticated;
grant execute on function public.remove_push_subscription(text) to authenticated;

-- ---------- 4. Notification helpers ----------
create or replace function public.notify_user(p_user uuid, p_type text, p_title text, p_body text, p_link text)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications(user_id, type, title, body, link)
  values (p_user, p_type, p_title, p_body, p_link);
$$;

create or replace function public.notify_admins(p_type text, p_title text, p_body text, p_link text)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications(user_id, type, title, body, link)
  select id, p_type, p_title, p_body, p_link from public.profiles where is_admin = true;
$$;

revoke all on function public.notify_user(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.notify_admins(text, text, text, text) from public, anon, authenticated;

-- ---------- 5. Triggers: apps ----------
-- App mpya imepakiwa -> admin ajulishwe, developer athibitishiwe
create or replace function public.trg_app_inserted()
returns trigger language plpgsql security definer set search_path = public as $$
declare dev_name text;
begin
  select coalesce(full_name, username, 'Developer') into dev_name from public.profiles where id = new.developer_id;
  if new.status = 'pending' then
    perform public.notify_admins('app_submitted', 'App mpya inasubiri idhini',
      new.name || ' (v' || coalesce(new.version_name,'?') || ') kutoka kwa ' || dev_name, '/admin?tab=pending');
    perform public.notify_user(new.developer_id, 'app_received', 'App yako imepokelewa',
      new.name || ' imetumwa kwa ukaguzi. Utaarifiwa ikishakamilika.', '/developer/apps');
  end if;
  return new;
end $$;
drop trigger if exists app_inserted on public.apps;
create trigger app_inserted after insert on public.apps
  for each row execute function public.trg_app_inserted();

-- Status imebadilika -> developer ajulishwe
create or replace function public.trg_app_status_changed()
returns trigger language plpgsql security definer set search_path = public as $$
declare note text := coalesce(nullif(new.admin_note, ''), '');
begin
  if new.status is not distinct from old.status then return new; end if;

  if new.status = 'approved' then
    perform public.notify_user(new.developer_id, 'app_approved', 'Hongera! App yako imeidhinishwa',
      new.name || ' sasa ipo live kwenye Store Dutoza.', '/app/' || new.slug);
  elsif new.status = 'rejected' then
    perform public.notify_user(new.developer_id, 'app_rejected', 'App yako imekataliwa',
      new.name || case when note <> '' then ': ' || note else '. Rekebisha kisha tuma tena.' end,
      '/developer/apps/' || new.id || '/edit');
  elsif new.status = 'blocked' then
    perform public.notify_user(new.developer_id, 'app_blocked', 'App yako imezuiwa',
      new.name || case when note <> '' then ': ' || note else ' imezuiwa na admin.' end, '/support');
  end if;
  return new;
end $$;
drop trigger if exists app_status_changed on public.apps;
create trigger app_status_changed after update of status on public.apps
  for each row execute function public.trg_app_status_changed();

-- Kinga: developer hawezi kubadilisha moja kwa moja content/status (lazima apitie approval)
create or replace function public.trg_guard_app_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if (new.name, new.slug, new.short_description, new.description, new.package_name,
        new.version_name, new.version_code, new.category_id, new.apk_url, new.apk_size,
        new.icon_url, new.status, new.developer_id, new.whats_new, new.admin_note)
       is distinct from
       (old.name, old.slug, old.short_description, old.description, old.package_name,
        old.version_name, old.version_code, old.category_id, old.apk_url, old.apk_size,
        old.icon_url, old.status, old.developer_id, old.whats_new, old.admin_note) then
      raise exception 'Mabadiliko ya app yanahitaji idhini ya admin. Tumia "Hariri App" kutuma ombi la sasisho.';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists guard_app_update on public.apps;
create trigger guard_app_update before update on public.apps
  for each row execute function public.trg_guard_app_update();

-- ---------- 6. Triggers: app_updates ----------
create or replace function public.trg_update_inserted()
returns trigger language plpgsql security definer set search_path = public as $$
declare a record; dev_name text;
begin
  select name into a from public.apps where id = new.app_id;
  select coalesce(full_name, username, 'Developer') into dev_name from public.profiles where id = new.developer_id;
  perform public.notify_admins('update_submitted', 'Sasisho linasubiri idhini',
    coalesce(a.name,'App') || ' - ' || dev_name || ' ametuma mabadiliko' ||
    case when new.version_name is not null then ' (v' || new.version_name || ')' else '' end,
    '/admin?tab=updates');
  perform public.notify_user(new.developer_id, 'update_received', 'Ombi la sasisho limepokelewa',
    coalesce(a.name,'App') || ': mabadiliko yako yanasubiri ukaguzi wa admin.', '/developer/apps');
  return new;
end $$;
drop trigger if exists update_inserted on public.app_updates;
create trigger update_inserted after insert on public.app_updates
  for each row execute function public.trg_update_inserted();

-- Admin anapitisha / anakataa sasisho (inatumia mabadiliko kwenye apps kama approved)
create or replace function public.review_app_update(p_update_id uuid, p_approve boolean, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  u public.app_updates%rowtype;
  a public.apps%rowtype;
  status_changed boolean := false;
begin
  if not public.is_admin() then raise exception 'Huna ruhusa ya admin'; end if;

  select * into u from public.app_updates where id = p_update_id for update;
  if not found then raise exception 'Sasisho halikupatikana'; end if;
  if u.status <> 'pending' then raise exception 'Sasisho hili tayari limeshughulikiwa'; end if;

  select * into a from public.apps where id = u.app_id;

  if p_approve then
    status_changed := a.status in ('pending', 'rejected');

    update public.apps set
      name = coalesce(u.name, name),
      short_description = coalesce(u.short_description, short_description),
      description = coalesce(u.description, description),
      package_name = coalesce(u.package_name, package_name),
      version_name = coalesce(u.version_name, version_name),
      version_code = coalesce(u.version_code, version_code),
      category_id = coalesce(u.category_id, category_id),
      apk_url = coalesce(u.apk_url, apk_url),
      apk_size = coalesce(u.apk_size, apk_size),
      icon_url = coalesce(u.icon_url, icon_url),
      whats_new = coalesce(u.change_notes, whats_new),
      status = case when status in ('pending','rejected') then 'approved' else status end,
      admin_note = null,
      updated_at = now()
    where id = u.app_id;

    if u.screenshots is not null then
      delete from public.app_screenshots where app_id = u.app_id;
      insert into public.app_screenshots(app_id, image_url, sort_order)
      select u.app_id, e.value #>> '{}', (e.ordinality - 1)::int
      from jsonb_array_elements(u.screenshots) with ordinality as e(value, ordinality);
    end if;
  end if;

  update public.app_updates set
    status = case when p_approve then 'approved' else 'rejected' end,
    admin_note = nullif(p_note, ''),
    reviewed_by = auth.uid(),
    reviewed_at = now()
  where id = u.id;

  if p_approve then
    if not status_changed then
      perform public.notify_user(u.developer_id, 'update_approved', 'Sasisho lako limeidhinishwa',
        coalesce(u.name, a.name) || ' imesasishwa na mabadiliko yako sasa yapo live.', '/app/' || a.slug);
    end if;
  else
    perform public.notify_user(u.developer_id, 'update_rejected', 'Sasisho lako limekataliwa',
      coalesce(a.name,'App') || case when nullif(p_note,'') is not null then ': ' || p_note else '. Rekebisha kisha tuma tena.' end,
      '/developer/apps/' || a.id || '/edit');
  end if;
end $$;
grant execute on function public.review_app_update(uuid, boolean, text) to authenticated;

-- ---------- 7. Triggers: customer care ----------
create or replace function public.trg_ticket_inserted()
returns trigger language plpgsql security definer set search_path = public as $$
declare who text;
begin
  select coalesce(full_name, username, 'Mtumiaji') into who from public.profiles where id = new.user_id;
  perform public.notify_admins('support_new', 'Ombi jipya la msaada', who || ': ' || new.subject, '/support/' || new.id);
  return new;
end $$;
drop trigger if exists ticket_inserted on public.support_tickets;
create trigger ticket_inserted after insert on public.support_tickets
  for each row execute function public.trg_ticket_inserted();

create or replace function public.trg_message_inserted()
returns trigger language plpgsql security definer set search_path = public as $$
declare t public.support_tickets%rowtype; who text;
begin
  select * into t from public.support_tickets where id = new.ticket_id;

  update public.support_tickets set
    last_message_at = now(),
    status = case when new.is_staff then 'answered' else 'open' end
  where id = new.ticket_id;

  if new.is_staff then
    perform public.notify_user(t.user_id, 'support_reply', 'Customer care wamejibu',
      left(new.body, 120), '/support/' || t.id);
  else
    select coalesce(full_name, username, 'Mtumiaji') into who from public.profiles where id = new.sender_id;
    -- ujumbe wa kwanza wa ticket tayari umeshatumiwa kama "ombi jipya"
    if (select count(*) from public.support_messages where ticket_id = new.ticket_id) > 1 then
      perform public.notify_admins('support_message', 'Ujumbe mpya wa msaada',
        who || ': ' || left(new.body, 100), '/support/' || t.id);
    end if;
  end if;
  return new;
end $$;
drop trigger if exists message_inserted on public.support_messages;
create trigger message_inserted after insert on public.support_messages
  for each row execute function public.trg_message_inserted();

-- ---------- 8. Realtime ----------
do $$
begin
  begin alter publication supabase_realtime add table public.notifications; exception when others then null; end;
  begin alter publication supabase_realtime add table public.support_messages; exception when others then null; end;
end $$;

-- ---------- 9. Muhimu: jifanye admin ----------
-- update public.profiles set is_admin = true where id = '<UUID-YAKO>';
