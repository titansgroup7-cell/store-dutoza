import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: apps } = await supabase
    .from("apps")
    .select("*, categories(name, slug)")
    .eq("status", "approved")
    .order("downloads_count", { ascending: false })
    .limit(12);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  const categoryList =
    categories && categories.length > 0
      ? categories
      : [
          { id: "1", name: "Games", slug: "games" },
          { id: "2", name: "Social", slug: "social" },
          { id: "3", name: "Education", slug: "education" },
          { id: "4", name: "Business", slug: "business" },
          { id: "5", name: "Tools", slug: "tools" },
          { id: "6", name: "Entertainment", slug: "entertainment" },
        ];

  const formatDownloads = (n: number) => {
    if (!n) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  };

  return (
    <div className="space-y-5">
      {/* Compact hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-4 py-5 sm:px-6 sm:py-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">
          Karibu Store Dutoza
        </h1>
        <p className="text-blue-100 text-xs sm:text-sm mb-3 max-w-md">
          Pakua apps bora za Dutoza kwa urahisi na usalama.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/apps"
            className="bg-white text-blue-700 font-semibold px-3.5 py-1.5 rounded-full text-xs hover:bg-blue-50 transition"
          >
            Angalia Apps
          </Link>
          <Link
            href="/developer"
            className="bg-blue-500/80 text-white font-semibold px-3.5 py-1.5 rounded-full text-xs hover:bg-blue-400 transition"
          >
            Pakia App
          </Link>
        </div>
      </section>

      {/* Categories - horizontal scroll chips juu */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-900">Categories</h2>
          <Link href="/apps" className="text-blue-600 text-[11px] font-medium">
            Zote →
          </Link>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {categoryList.map((cat) => {
            const slug = cat.slug || cat.name.toLowerCase();
            return (
              <Link
                key={cat.id || cat.name}
                href={`/apps?category=${encodeURIComponent(slug)}`}
                className="flex-shrink-0 inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full pl-1.5 pr-2.5 py-1 hover:border-blue-400 hover:bg-blue-50 transition"
              >
                <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-bold">
                  {cat.name[0]}
                </span>
                <span className="text-[11px] font-medium text-gray-700 whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Apps grid - compact cards */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-900">Apps Maarufu</h2>
          <Link href="/apps" className="text-blue-600 text-[11px] font-medium">
            Angalia zote →
          </Link>
        </div>

        {!apps || apps.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-500 text-xs">
              Bado hakuna apps. Kuwa wa kwanza kupakia!
            </p>
            <Link
              href="/developer/upload"
              className="inline-block mt-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-[11px] font-medium"
            >
              Pakia App
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {apps.map((app) => (
              <Link
                key={app.id}
                href={`/app/${app.slug}`}
                className="group bg-white border border-gray-200 rounded-xl p-2.5 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex gap-2.5">
                  <div className="w-11 h-11 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden ring-1 ring-black/5">
                    {app.icon_url ? (
                      <img
                        src={app.icon_url}
                        alt={app.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg text-gray-400">
                        📱
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-[13px] leading-tight truncate group-hover:text-blue-600 transition">
                      {app.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                      {app.short_description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-gray-700">
                        <span className="text-yellow-500 text-[10px]">★</span>
                        {Number(app.rating_average || 0).toFixed(1)}
                      </span>
                      <span className="text-gray-300 text-[10px]">·</span>
                      <span className="text-[11px] text-gray-500">
                        {formatDownloads(app.downloads_count || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Compact CTA */}
      <section className="bg-gray-900 rounded-xl px-4 py-5 text-center text-white">
        <h2 className="text-sm font-bold mb-1">Wewe ni Developer?</h2>
        <p className="text-gray-400 text-[11px] mb-3 max-w-sm mx-auto">
          Pakia app yako kwenye Store Dutoza.
        </p>
        <Link
          href="/developer"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-1.5 rounded-full text-xs transition"
        >
          Anza Kupakia
        </Link>
      </section>
    </div>
  );
}
