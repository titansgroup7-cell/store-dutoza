import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Download, HardDrive, Tag, Sparkles, LifeBuoy } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import ReviewForm from "@/components/ReviewForm";
import DownloadButton from "@/components/DownloadButton";
import { formatDate, formatDownloads, formatSize } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AppDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: app } = await supabase
    .from("apps")
    .select("*, profiles(full_name, username, avatar_url), categories(name)")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!app) notFound();

  const [{ data: screenshots }, { data: reviews }] = await Promise.all([
    supabase.from("app_screenshots").select("id, image_url").eq("app_id", app.id).order("sort_order", { ascending: true }),
    supabase
      .from("reviews")
      .select("id, rating, comment, created_at, profiles(full_name, username, avatar_url)")
      .eq("app_id", app.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const rating = Number(app.rating_average) || 0;
  const ratingCount = app.rating_count || reviews?.length || 0;
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews?.filter((r: any) => r.rating === star).length || 0;
    return { star, pct: ratingCount > 0 ? (count / ratingCount) * 100 : 0 };
  });

  const stat = "flex flex-col items-center justify-center gap-0.5 py-3 px-2 text-center";

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link href="/apps" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="w-4 h-4" /> Apps
      </Link>

      {/* HERO */}
      <div className="card overflow-hidden">
        <div className="h-24 sm:h-32 bg-gradient-to-r from-brand-600 via-violet-600 to-fuchsia-500 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
        </div>
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row gap-5 -mt-12 sm:-mt-14">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white overflow-hidden shadow-float ring-4 ring-white flex-shrink-0">
              {app.icon_url ? (
                <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-brand-600 bg-brand-50">
                  {app.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 sm:pt-16">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{app.name}</h1>
              <p className="text-brand-600 font-semibold text-sm mt-0.5">
                {app.profiles?.full_name || app.profiles?.username || "Developer"}
              </p>
              <p className="text-slate-500 text-sm mt-1.5">{app.short_description}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 divide-x divide-slate-100 rounded-2xl bg-slate-50 mt-6">
            <div className={stat}>
              <span className="flex items-center gap-1 font-extrabold text-slate-900">
                {rating.toFixed(1)} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </span>
              <span className="text-[11px] text-slate-500">{ratingCount} reviews</span>
            </div>
            <div className={stat}>
              <span className="flex items-center gap-1 font-extrabold text-slate-900">
                <Download className="w-3.5 h-3.5 text-slate-400" /> {formatDownloads(app.downloads_count, true)}
              </span>
              <span className="text-[11px] text-slate-500">Downloads</span>
            </div>
            <div className={stat}>
              <span className="flex items-center gap-1 font-extrabold text-slate-900">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" /> {formatSize(app.apk_size)}
              </span>
              <span className="text-[11px] text-slate-500">Ukubwa</span>
            </div>
            <div className={stat}>
              <span className="flex items-center gap-1 font-extrabold text-slate-900">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> v{app.version_name}
              </span>
              <span className="text-[11px] text-slate-500">{app.categories?.name || "Version"}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-start gap-3">
            <DownloadButton apkUrl={app.apk_url} appName={app.name} appId={app.id} />
            <ShareButton title={app.name} text={app.short_description || ""} />
          </div>
        </div>
      </div>

      {/* WHAT'S NEW */}
      {app.whats_new && (
        <section className="card p-5 sm:p-6">
          <h2 className="font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Kipya kwenye v{app.version_name}
          </h2>
          <p className="text-sm text-slate-600 mt-2 whitespace-pre-line leading-relaxed">{app.whats_new}</p>
        </section>
      )}

      {/* SCREENSHOTS */}
      <section>
        <h2 className="font-extrabold text-slate-900 mb-3 px-1">Screenshots</h2>
        <ScreenshotGallery screenshots={screenshots || []} appName={app.name} />
      </section>

      {/* ABOUT */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-extrabold text-slate-900 mb-3">Kuhusu App hii</h2>
        <p className="text-slate-600 whitespace-pre-line leading-relaxed text-[15px]">
          {app.description || app.short_description || "Hakuna maelezo."}
        </p>
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-5 text-sm">
          {[
            ["Version", app.version_name],
            ["Package", app.package_name || "N/A"],
            ["Ukubwa", formatSize(app.apk_size)],
            ["Imesasishwa", formatDate(app.updated_at || app.created_at)],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">{k}</p>
              <p className="font-bold text-slate-800 truncate">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-extrabold text-slate-900 mb-5">Ratings & Reviews</h2>
        <div className="flex flex-col md:flex-row gap-8 mb-6">
          <div className="flex flex-col items-center justify-center md:w-40 flex-shrink-0">
            <p className="text-6xl font-extrabold text-slate-900 leading-none">{rating.toFixed(1)}</p>
            <div className="flex gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">{ratingCount} reviews</p>
          </div>
          <div className="flex-1 space-y-2 self-center">
            {dist.map(({ star, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-3 font-semibold">{star}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-300 to-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5 mb-5">
          <h3 className="font-bold text-slate-900 mb-3">Andika Review</h3>
          <ReviewForm appId={app.id} />
        </div>

        {reviews && reviews.length > 0 && (
          <div className="border-t border-slate-100 pt-5 space-y-5">
            <h3 className="font-bold text-slate-900">Maoni ya watumiaji ({reviews.length})</h3>
            {reviews.map((review: any) => {
              const who = review.profiles?.full_name || review.profiles?.username || "User";
              return (
                <div key={review.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {who.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{who}</span>
                      <span className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        ))}
                      </span>
                    </div>
                    {review.comment && <p className="text-slate-600 text-sm mt-1 leading-relaxed">{review.comment}</p>}
                    <p className="text-[11px] text-slate-400 mt-1">{formatDate(review.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Link href="/support" className="card card-hover p-4 flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
          <LifeBuoy className="w-5 h-5" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">Una tatizo na app hii?</p>
          <p className="text-xs text-slate-500">Wasiliana na Customer Care, tutakusaidia.</p>
        </div>
      </Link>
    </div>
  );
}
