import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Smartphone, Gamepad2, Users, GraduationCap, Briefcase, Wrench, Clapperboard, LayoutGrid } from "lucide-react";
import AppCard from "@/components/AppCard";

export const dynamic = "force-dynamic";

const ICONS: Record<string, any> = {
  games: Gamepad2,
  social: Users,
  education: GraduationCap,
  business: Briefcase,
  tools: Wrench,
  entertainment: Clapperboard,
};

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: popular }, { data: fresh }, { data: categories }, { count }] = await Promise.all([
    supabase
      .from("apps")
      .select("*, categories(name, slug)")
      .eq("status", "approved")
      .order("downloads_count", { ascending: false })
      .limit(12),
    supabase
      .from("apps")
      .select("*, categories(name, slug)")
      .eq("status", "approved")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("apps").select("id", { count: "exact", head: true }).eq("status", "approved"),
  ]);

  const categoryList =
    categories && categories.length > 0
      ? categories
      : ["Games", "Social", "Education", "Business", "Tools", "Entertainment"].map((n) => ({
          id: n,
          name: n,
          slug: n.toLowerCase(),
        }));

  return (
    <div className="space-y-9">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white px-6 py-10 sm:px-10 sm:py-14 shadow-float">
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-brand-600/50 blur-3xl animate-float" />
        <div className="absolute -bottom-28 -left-10 w-72 h-72 rounded-full bg-violet-600/40 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Official Dutoza App Store
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-balance">
            Pakua apps bora, <span className="bg-gradient-to-r from-brand-300 to-violet-300 bg-clip-text text-transparent">salama na haraka.</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-md">
            Kila app inakaguliwa na timu yetu kabla ya kufika kwako. {count ? `Apps ${count} zinakusubiri.` : ""}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/apps" className="btn bg-white text-slate-900 hover:bg-slate-100 shadow-lg">
              Angalia Apps <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/developer" className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur">
              Pakia App Yako
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300 font-medium">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Zimekaguliwa</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-300" /> Download ya haraka</span>
            <span className="inline-flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-brand-300" /> Android</span>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Categories</h2>
          <Link href="/apps" className="text-xs font-semibold text-brand-600 hover:underline">Zote →</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
          {categoryList.map((cat: any) => {
            const slug = cat.slug || cat.name.toLowerCase();
            const Icon = ICONS[slug] || LayoutGrid;
            return (
              <Link
                key={cat.id}
                href={`/apps?category=${encodeURIComponent(slug)}`}
                className="flex-shrink-0 card card-hover px-4 py-3 flex items-center gap-3 min-w-[140px]"
              >
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 text-brand-600 flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                <span className="text-sm font-bold text-slate-800">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FRESH */}
      {fresh && fresh.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Zilizosasishwa hivi karibuni</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {fresh.map((app: any, i: number) => (
              <AppCard key={app.id} app={app} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* POPULAR */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Maarufu zaidi</h2>
          <Link href="/apps" className="text-xs font-semibold text-brand-600 hover:underline">Angalia zote →</Link>
        </div>
        {!popular || popular.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="text-3xl mb-2">📱</div>
            <p className="text-sm text-slate-500">Bado hakuna apps. Kuwa wa kwanza kupakia!</p>
            <Link href="/developer/upload" className="btn-primary btn-sm mt-4">Pakia App</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {popular.map((app: any, i: number) => (
              <AppCard key={app.id} app={app} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="rounded-3xl bg-gradient-to-r from-brand-600 to-violet-600 text-white p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-glow">
        <div>
          <h2 className="text-xl font-extrabold">Wewe ni Developer?</h2>
          <p className="text-sm text-white/80 mt-1">Pakia app yako, fuatilia idhini na upate taarifa papo hapo.</p>
        </div>
        <Link href="/developer" className="btn bg-white text-brand-700 hover:bg-brand-50 self-start sm:self-auto">
          Anza Kupakia <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
