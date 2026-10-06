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

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Apps Zote</h1>

      {!apps || apps.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-gray-500 text-lg">
            Bado hakuna apps zilizoidhinishwa.
          </p>
          <p className="text-gray-400 mt-2">
            Developers wanaweza kuanza kupakia apps sasa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={`/app/${app.slug}`}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-blue-300 transition"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden">
                  {app.icon_url ? (
                    <img
                      src={app.icon_url}
                      alt={app.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                      📱
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {app.short_description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-yellow-500 text-sm">
                      ★ {app.rating_average || "0.0"}
                    </span>
                    <span className="text-gray-400 text-sm">
                      • {app.downloads_count || 0} downloads
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
