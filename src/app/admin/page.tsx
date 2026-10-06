import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminAppActions from "@/components/AdminAppActions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return (
      <div className="text-center py-16">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Access Denied</h1>
        <p className="text-gray-500 text-xs">Huna ruhusa ya kuingia hapa.</p>
      </div>
    );
  }

  const { data: pendingApps } = await supabase
    .from("apps")
    .select("*, profiles(full_name, username)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const { data: allApps } = await supabase
    .from("apps")
    .select("*, profiles(full_name, username)")
    .order("created_at", { ascending: false })
    .limit(50);

  const statusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "blocked":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5">
          Admin Panel
        </h1>
        <p className="text-gray-500 text-xs">
          Approve, reject, block au futa apps
        </p>
      </div>

      {/* Pending */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 mb-2">
          Zinazosubiri ({pendingApps?.length || 0})
        </h2>
        {!pendingApps || pendingApps.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-gray-500 text-xs">
              Hakuna apps zinazosubiri idhini.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingApps.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-gray-200 rounded-xl p-3 flex items-start gap-3"
              >
                <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {app.icon_url ? (
                    <img
                      src={app.icon_url}
                      alt={app.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg text-gray-400">
                      📱
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[13px] text-gray-900">
                    {app.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    by{" "}
                    {app.profiles?.full_name ||
                      app.profiles?.username ||
                      "—"}{" "}
                    • v{app.version_name}
                  </p>
                  <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">
                    {app.short_description}
                  </p>
                  {app.apk_url && (
                    <a
                      href={app.apk_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-[11px] mt-1 inline-block hover:underline"
                    >
                      Download APK →
                    </a>
                  )}
                </div>

                <AdminAppActions
                  appId={app.id}
                  currentStatus={app.status}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All apps */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 mb-2">
          Apps Zote (hivi karibuni)
        </h2>
        {!allApps || allApps.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-gray-500 text-xs">Hakuna apps.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allApps.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {app.icon_url ? (
                    <img
                      src={app.icon_url}
                      alt={app.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base text-gray-400">
                      📱
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[13px] text-gray-900 truncate">
                      {app.name}
                    </h3>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    by{" "}
                    {app.profiles?.full_name ||
                      app.profiles?.username ||
                      "—"}{" "}
                    • v{app.version_name} • {app.downloads_count || 0} dl
                  </p>
                </div>

                {app.status === "approved" && app.slug && (
                  <Link
                    href={`/app/${app.slug}`}
                    className="text-blue-600 text-[11px] font-medium hover:underline whitespace-nowrap"
                  >
                    View
                  </Link>
                )}

                <AdminAppActions
                  appId={app.id}
                  currentStatus={app.status}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
