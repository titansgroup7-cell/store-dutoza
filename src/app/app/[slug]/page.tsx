import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import ReviewForm from "@/components/ReviewForm";
import DownloadButton from "@/components/DownloadButton";

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
    .select("*, profiles(full_name, username, avatar_url)")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!app) {
    notFound();
  }

  // Screenshots
  const { data: screenshots } = await supabase
    .from("app_screenshots")
    .select("id, image_url")
    .eq("app_id", app.id)
    .order("sort_order", { ascending: true });

  // Reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, profiles(full_name, username, avatar_url)")
    .eq("app_id", app.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const formatSize = (bytes: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / 1024 / 1024;
    return mb.toFixed(1) + " MB";
  };

  const formatDownloads = (n: number) => {
    if (!n) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M+";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K+";
    return String(n);
  };

  const rating = Number(app.rating_average) || 0;
  const ratingCount = app.rating_count || reviews?.length || 0;

  // Star distribution
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews?.filter((r) => r.rating === star).length || 0;
    const pct = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* ===== HERO HEADER ===== */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 md:p-10">
          <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
            {/* Big Icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden shadow-md ring-1 ring-black/5">
              {app.icon_url ? (
                <img
                  src={app.icon_url}
                  alt={app.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl text-gray-400">
                  📱
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {app.name}
              </h1>
              <p className="text-blue-600 font-medium mt-1 text-sm sm:text-base">
                {app.profiles?.full_name || app.profiles?.username || "Developer"}
              </p>
              <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                {app.short_description}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-500 text-lg">★</span>
                  <span className="font-semibold text-gray-900">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-gray-400">
                    ({ratingCount} reviews)
                  </span>
                </div>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <span className="text-gray-600 font-medium">
                  {formatDownloads(app.downloads_count || 0)} downloads
                </span>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <span className="text-gray-600">{formatSize(app.apk_size)}</span>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <span className="text-gray-600">v{app.version_name}</span>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-start gap-3">
                <DownloadButton apkUrl={app.apk_url} appName={app.name} appId={app.id} />
                <ShareButton
                  title={app.name}
                  text={app.short_description || ""}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SCREENSHOTS ===== */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 px-1">
          Screenshots
        </h2>
        <ScreenshotGallery
          screenshots={screenshots || []}
          appName={app.name}
        />
      </section>

      {/* ===== ABOUT ===== */}
      <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Kuhusu App hii</h2>
        <p className="text-gray-600 whitespace-pre-line leading-relaxed text-[15px]">
          {app.description || app.short_description || "Hakuna maelezo."}
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Version
            </p>
            <p className="font-semibold text-gray-800">{app.version_name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Package
            </p>
            <p className="font-semibold text-gray-800 truncate text-sm">
              {app.package_name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Size
            </p>
            <p className="font-semibold text-gray-800">
              {formatSize(app.apk_size)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Updated
            </p>
            <p className="font-semibold text-gray-800">
              {new Date(app.updated_at || app.created_at).toLocaleDateString(
                "sw-TZ",
                { day: "numeric", month: "short", year: "numeric" }
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ===== RATINGS & REVIEWS ===== */}
      <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Ratings & Reviews
        </h2>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Big rating number */}
          <div className="flex flex-col items-center justify-center md:w-40 flex-shrink-0">
            <p className="text-6xl font-bold text-gray-900 leading-none">
              {rating.toFixed(1)}
            </p>
            <div className="flex gap-0.5 mt-2 text-yellow-400 text-xl">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s}>{s <= Math.round(rating) ? "★" : "☆"}</span>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {ratingCount} reviews
            </p>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 space-y-2">
            {dist.map(({ star, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-3">{star}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Write review */}
        <div className="border-t border-gray-100 pt-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Andika Review</h3>
          <ReviewForm appId={app.id} />
        </div>

        {/* Reviews list */}
        {reviews && reviews.length > 0 && (
          <div className="border-t border-gray-100 pt-6 space-y-5">
            <h3 className="font-semibold text-gray-900">
              Maoni ya watumiaji ({reviews.length})
            </h3>
            {reviews.map((review: any) => (
              <div
                key={review.id}
                className="flex gap-3 pb-5 border-b border-gray-50 last:border-0"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                  {(
                    review.profiles?.full_name ||
                    review.profiles?.username ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 text-sm">
                      {review.profiles?.full_name ||
                        review.profiles?.username ||
                        "User"}
                    </span>
                    <span className="text-yellow-400 text-sm">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.created_at).toLocaleDateString("sw-TZ", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link
        href="/apps"
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        ← Rudi kwenye Apps
      </Link>
    </div>
  );
}
