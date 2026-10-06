import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AppDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: app } = await supabase
    .from("apps")
    .select("*, profiles(full_name, username)")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!app) {
    notFound();
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / 1024 / 1024;
    return mb.toFixed(1) + " MB";
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Icon */}
          <div className="w-28 h-28 bg-gray-100 rounded-3xl flex-shrink-0 overflow-hidden">
            {app.icon_url ? (
              <img
                src={app.icon_url}
                alt={app.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                📱
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {app.name}
            </h1>
            <p className="text-gray-500 mt-1">
              {app.profiles?.full_name || app.profiles?.username || "Developer"}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                {app.rating_average || "0.0"}
              </span>
              <span>{app.downloads_count || 0} downloads</span>
              <span>{formatSize(app.apk_size)}</span>
              <span>v{app.version_name}</span>
            </div>

            {/* Download Button */}
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={app.apk_url}
                download
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition inline-flex items-center gap-2"
              >
                Pakua APK
              </a>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: app.name,
                      text: app.short_description,
                      url: window.location.href,
                    });
                  }
                }}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-full transition"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Kuhusu App hii</h2>
        <p className="text-gray-600 whitespace-pre-line leading-relaxed">
          {app.description || app.short_description || "Hakuna maelezo."}
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Version</p>
            <p className="font-medium text-gray-800">{app.version_name}</p>
          </div>
          <div>
            <p className="text-gray-400">Package</p>
            <p className="font-medium text-gray-800 truncate">
              {app.package_name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Size</p>
            <p className="font-medium text-gray-800">
              {formatSize(app.apk_size)}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Updated</p>
            <p className="font-medium text-gray-800">
              {new Date(app.updated_at || app.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/apps" className="text-blue-600 hover:underline text-sm">
          ← Rudi kwenye Apps
        </Link>
      </div>
    </div>
  );
}
