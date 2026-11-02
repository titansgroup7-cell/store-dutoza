# Store Dutoza v2 - Mwongozo wa kuwasha

## 1. Install
```bash
npm install
cp .env.example .env.local   # jaza thamani
```

## 2. Database (Supabase)
1. Fungua **SQL Editor** -> bandika yote kwenye `supabase/schema_v2.sql` -> **Run**.
2. Jifanye admin (badilisha UUID yako kutoka Authentication -> Users):
   ```sql
   update public.profiles set is_admin = true where id = '<UUID-YAKO>';
   ```
3. Realtime: schema inaongeza `notifications` na `support_messages` kwenye publication
   ya `supabase_realtime` yenyewe. Kama haikufanya kazi: Database -> Replication.

## 3. Push notifications
1. Tengeneza VAPID keys: `npx web-push generate-vapid-keys`
2. Weka kwenye `.env.local` (na kwenye Vercel/hosting yako):
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = public key
   - `VAPID_PRIVATE_KEY` = private key
   - `VAPID_SUBJECT` = `mailto:email-yako`
   - `SUPABASE_SERVICE_ROLE_KEY` = Project Settings -> API -> service_role (SIRI, server only)
   - `PUSH_WEBHOOK_SECRET` = neno lolote refu la siri
3. Supabase -> **Database -> Webhooks -> Create**:
   - Table: `notifications`, Event: **Insert**
   - Type: HTTP Request, Method: POST
   - URL: `https://DOMAIN-YAKO/api/push/webhook`
   - Header: `x-webhook-secret: <PUSH_WEBHOOK_SECRET>`
4. Admin na developer wafungue **Notifications** (au Dashboard) kisha bonyeza
   **"Washa arifa za simu"** mara moja kwenye kila kifaa.

Push inahitaji **HTTPS** (localhost inaruhusiwa kwa majaribio).

## 4. Mtiririko
- Developer anapakia app -> status `pending` -> admin anapata notification + push.
- Developer anabonyeza **Hariri App** -> anatuma ombi la sasisho -> admin anapata notification + push.
  Mabadiliko HAYAONEKANI kwa wateja mpaka admin aidhinishe (kinga ipo kwenye database).
- Admin anaidhinisha/anakataa (anaweza kuandika sababu) -> developer anapata notification + push.
- Customer care: `/support` kwa watumiaji, admin anajibu kupitia `/admin?tab=support`.
