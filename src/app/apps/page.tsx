import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AppsPage() {
  const supabase = await createClient();

  const { data: apps } = await supabase
    .from("apps")
    .select("*")
    .eq("status", "approved")
    .order("downloads_count", { ascending: false });

  const formatDownloads = (n: number) => {
    if (!n) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M+";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K+";
    return String(n);
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        Apps Zote
      </h1>
      <p className="text-gray-500 mb-8">
        Pakua apps bora za Dutoza
      </p>

      {!apps || apps.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center">
          <div className="text-5xl mb-4">📱</div>
          <p className="text-gray-500 text-lg">
            Bado hakuna apps zilizoidhinishwa.
          </p>
          <p className="text-gray-400 mt-2">
            Developers wanaweza kuanza kupakia apps sasa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={`/app/${app.slug}`}
              className="group bg-white border border-gray-200 rounded-3xl p-5 hover:shadow-xl hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex gap-4">
                {/* Large icon */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden shadow-md ring-1 ring-black/5 group-hover:shadow-lg transition">
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
                  <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-blue-600 transition">
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-snug">
                    {app.short_description}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
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
