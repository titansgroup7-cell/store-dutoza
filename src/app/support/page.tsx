import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, MessageCircle } from "lucide-react";
import NewTicketForm from "@/components/NewTicketForm";
import { statusMeta, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

const FAQ = [
  ["Kwa nini app yangu haionekani kwenye store?", "Kila app mpya hukaguliwa na admin. Ukiidhinishwa utapata notification. Angalia hali yake kwenye Apps Zangu."],
  ["Nawezaje kubadilisha app niliyopakia?", "Nenda Apps Zangu → Hariri. Mabadiliko yatatumwa kwa admin na yataonekana live baada ya kuidhinishwa."],
  ["Nitajuaje admin akimaliza kukagua?", "Utapata notification ndani ya store, na push kwenye simu ukiwasha arifa za simu."],
];

export default async function SupportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/support");

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id, subject, status, last_message_at")
    .eq("user_id", user.id)
    .order("last_message_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Customer Care</h1>
        <p className="page-sub">Tuko hapa kukusaidia. Tuma ombi na utajibiwa humu humu.</p>
      </div>

      {tickets && tickets.length > 0 && (
        <section>
          <h2 className="font-bold text-slate-900 mb-2">Maombi yako</h2>
          <div className="card divide-y divide-slate-100 overflow-hidden">
            {tickets.map((t: any) => {
              const m = statusMeta(t.status);
              return (
                <Link key={t.id} href={`/support/${t.id}`} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition">
                  <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{t.subject}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(t.last_message_at)}</p>
                  </div>
                  <span className={m.cls}>{m.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-bold text-slate-900 mb-2">Ombi jipya</h2>
        <NewTicketForm />
      </section>

      <section>
        <h2 className="font-bold text-slate-900 mb-2">Maswali yanayoulizwa mara nyingi</h2>
        <div className="space-y-2">
          {FAQ.map(([q, a]) => (
            <details key={q} className="card px-4 py-3 group">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800 list-none flex items-center justify-between gap-2">
                {q}
                <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition" />
              </summary>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
