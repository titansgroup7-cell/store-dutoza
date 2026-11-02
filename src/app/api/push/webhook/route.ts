import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Supabase Database Webhook (INSERT kwenye table ya `notifications`) inaita hapa.
 * Tunatuma push kwa kila kifaa kilichosajiliwa cha mpokeaji (admin au developer).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.PUSH_WEBHOOK_SECRET;
  if (!secret || req.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!pub || !priv || !serviceKey) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const rec = body?.record;
  if (!rec?.user_id) return NextResponse.json({ ok: true, skipped: true });

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@dutoza.com",
    pub,
    priv
  );

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", rec.user_id);

  if (!subs || subs.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const payload = JSON.stringify({
    title: rec.title || "Store Dutoza",
    body: rec.body || "",
    url: rec.link || "/notifications",
    tag: rec.type || undefined,
  });

  let sent = 0;
  const dead: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        );
        sent++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) dead.push(s.id);
      }
    })
  );

  if (dead.length) await admin.from("push_subscriptions").delete().in("id", dead);

  return NextResponse.json({ ok: true, sent, removed: dead.length });
}
