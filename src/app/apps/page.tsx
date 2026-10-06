import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

const FALLBACK_CATEGORIES = [
  "Games",
  "Social",
  "Education",
  "Business",
  "Tools",
  "Entertainment",
  "Productivity",
  "Lifestyle",
  "Health",
  "Finance",
];

export default async function AppsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;
  const supabase = await createClient();

  const { data: dbCategories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  const categories =
    dbCategories && dbCategories.length > 0
      ? dbCategories
      : FALLBACK_CATEGORIES.map((name) => ({
          id: name.toLowerCase(),
          name,
          slug: name.toLowerCase(),
        }));

  let selectedCategoryId: string | null = null;
  let selectedCategoryName: string | null = null;

  if (categorySlug) {
    const match = categories.find(
      (c) =>
        (c.slug || c.name.toLowerCase()) === categorySlug.toLowerCase() ||
        c.id === categorySlug
    );
    if (match) {
      selectedCategoryId = match.id;
      selectedCategoryName = match.name;
    }
  }

  let query = supabase
    .from("apps")
    .select("*, categories(name, slug)")
    .eq("status", "approved")
    .order("downloads_count", { ascending: false });

  if (selectedCategoryId && dbCategories && dbCategories.length > 0) {
    query = query.eq("category_id", selectedCategoryId);
  }

  const { data: apps } = await query;
  const filteredApps = apps || [];

  const formatDownloads = (n: number) => {
    if (!n) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M+";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K+";
    return String(n);
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        {selectedCategoryName
          ? `Category: ${selectedCategoryName}`
          : "Apps Zote"}
      </h1>
      <p className="text-gray-500 mb-6">
        {selectedCategoryName
          ? `Apps za ${selectedCategoryName}`
          : "Pakua apps bora za Dutoza"}
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/apps"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            !categorySlug
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white border border-gray-200 text-gray-700 hover:border-blue-400"
          }`}
        >
          Zote
        </Link>
        {categories.map((cat) => {
          const slug = cat.slug || cat.name.toLowerCase();
          const active =
            categorySlug?.toLowerCase() === slug.toLowerCase() ||
            categorySlug === cat.id;
          return (
            <Link
              key={cat.id}
              href={`/apps?category=${encodeURIComponent(slug)}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                active
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-blue-400"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {!filteredApps || filteredApps.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center">
          <div className="text-5xl mb-4">📱</div>
          <p className="text-gray-500 text-lg">
            {selectedCategoryName
              ? `Hakuna apps katika category "${selectedCategoryName}".`
              : "Bado hakuna apps zilizoidhinishwa."}
          </p>
          <Link
            href="/developer/upload"
            className="inline-block mt-4 text-blue-600 font-medium text-sm hover:underline"
          >
            Pakia app →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app: any) => (
            <Link
              key={app.id}
              href={`/app/${app.slug}`}
              className="group bg-white border border-gray-200 rounded-3xl p-5 hover:shadow-xl hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden shadow-sm ring-1 ring-black/5">
                  {app.icon_url ? (
                    <img
                      src={app.icon_url}
                      alt={app.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
                      📱
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 py-0.5">
                  <h3 className="font-semibold text-gray-900 text-[15px] truncate group-hover:text-blue-600 transition">
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-snug">
                    {app.short_description}
                  </p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {app.categories?.name && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {app.categories.name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-800">
                        {Number(app.rating_average || 0).toFixed(1)}
                      </span>
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500">
                      {formatDownloads(app.downloads_count || 0)} downloads
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
