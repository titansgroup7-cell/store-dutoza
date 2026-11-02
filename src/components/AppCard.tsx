import Link from "next/link";
import { Download, Star } from "lucide-react";
import { formatDownloads } from "@/lib/format";

export default function AppCard({ app, index = 0 }: { app: any; index?: number }) {
  return (
    <Link
      href={`/app/${app.slug}`}
      className="group card card-hover p-3.5 flex gap-3.5 animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-violet-100 flex-shrink-0 overflow-hidden ring-1 ring-black/5 shadow-sm">
        {app.icon_url ? (
          <img
            src={app.icon_url}
            alt={app.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl font-extrabold text-brand-600">
            {app.name?.[0]?.toUpperCase() || "D"}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 text-sm leading-tight truncate group-hover:text-brand-700 transition">
          {app.name}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{app.short_description}</p>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {Number(app.rating_average || 0).toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Download className="w-3 h-3" />
            {formatDownloads(app.downloads_count)}
          </span>
          {app.categories?.name && (
            <span className="badge-brand !py-0 hidden sm:inline-flex">{app.categories.name}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
