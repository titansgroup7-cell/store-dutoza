import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { SearchX } from "lucide-react";
import AppCard from "@/components/AppCard";

export const dynamic = "force-dynamic";

const FALLBACK = ["Games", "Social", "Education", "Business", "Tools", "Entertainment", "Productivity", "Lifestyle", "Health", "Finance"];

const SORTS = [
  { key: "popular", label: "Maarufu", col: "downloads_count" },
  { key: "new", label: "Mpya", col: "created_at" },
  { key: "rating", label: "Rating", col: "rating_average" },
];

export default async function AppsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
}) {
  const { category: categorySlug, q, sort } = await searchParams;
  const supabase = await createClient();

  const { data: dbCategories } = await supabase.from("categories").select("id, name, slug").order("name");
  const categories =
    dbCategories && dbCategories.length > 0
      ? dbCategories
      : FALLBACK.map((name) => ({ id: name.toLowerCase(), name, slug: name.toLowerCase() }));

  const selected = categorySlug
    ? categories.find(
        (c: any) => (c.slug || c.name.toLowerCase()) === categorySlug.toLowerCase() || c.id === categorySlug
      )
    : undefined;

  const sortDef = SORTS.find((s) => s.key === sort) || SORTS[0];

  let query = supabase
    .from("apps")
    .select("*, categories(name, slug)")
    .eq("status", "approved")
    .order(sortDef.col, { ascending: false });

  if (selected && dbCategories && dbCategories.length > 0) query = query.eq("category_id", selected.id);
  const term = q?.trim().replace(/[%,()]/g, " ");
  if (term) query = query.or(`name.ilike.%${term}%,short_description.ilike.%${term}%`);

  const { data: apps } = await query;
  const list = apps || [];

  const href = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const base: Record<string, string | undefined> = { category: categorySlug, q, sort, ...extra };
    Object.entries(base).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `/apps?${s}` : "/apps";
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">{term ? `Matokeo ya "${term}"` : selected ? selected.name : "Apps Zote"}</h1>
        <p className="page-sub">{list.length} apps zimepatikana</p>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
        <Link href={href({ category: undefined })} className={!categorySlug ? "chip-active" : "chip"}>Zote</Link>
        {categories.map((cat: any) => {
          const slug = cat.slug || cat.name.toLowerCase();
          const active = categorySlug?.toLowerCase() === slug.toLowerCase() || categorySlug === cat.id;
          return (
            <Link key={cat.id} href={href({ category: slug })} className={active ? "chip-active" : "chip"}>
              {cat.name}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold">Panga kwa:</span>
        {SORTS.map((s) => (
          <Link
            key={s.key}
            href={href({ sort: s.key })}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              sortDef.key === s.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <SearchX className="w-7 h-7" />
          </div>
          <p className="font-bold text-slate-900">Hakuna apps zilizopatikana</p>
          <p className="text-sm text-slate-500 mt-1">Jaribu neno lingine au category tofauti.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((app: any, i: number) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
