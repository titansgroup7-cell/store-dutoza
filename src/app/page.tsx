import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: apps } = await supabase
    .from("apps")
    .select("*")
    .eq("status", "approved")
    .order("downloads_count", { ascending: false })
    .limit(6);

  return (
    <div className="space-y-10">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Karibu Store Dutoza
          </h1>
          <p className="text-blue-100 text-lg mb-6">
            Pakua apps bora za Dutoza kwa urahisi na usalama. App Store rasmi ya
            Dutoza.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/apps"
              className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-full hover:bg-blue-50 transition"
            >
              Angalia Apps
            </Link>
            <Link
              href="/developer"
              className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-400 transition"
            >
              Pakia App Yako
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {["Games", "Social", "Education", "Business", "Tools", "Entertainment"].map(
            (cat) => (
              <Link
                key={cat}
                href={`/apps?category=${cat.toLowerCase()}`}
                className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:border-blue-500 hover:shadow-md transition"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-2 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {cat[0]}
                </div>
                <span className="text-sm font-medium text-gray-700">{cat}</span>
              </Link>
            )
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Apps Maarufu</h2>
          <Link href="/apps" className="text-blue-600 text-sm font-medium">
            Angalia zote →
          </Link>
        </div>

        {!apps || apps.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <p className="text-gray-500">Bado hakuna apps. Kuwa wa kwanza kupakia!</p>
            <Link
              href="/developer/upload"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium"
            >
              Pakia App
            </Link>
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
      </section>

      <section className="bg-gray-900 rounded-3xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">Wewe ni Developer?</h2>
        <p className="text-gray-300 mb-6 max-w-lg mx-auto">
          Pakia app yako kwenye Store Dutoza na uifikie maelfu ya watumiaji.
        </p>
        <Link
          href="/developer"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-full transition"
        >
          Anza Kupakia
        </Link>
      </section>
    </div>
  );
}
