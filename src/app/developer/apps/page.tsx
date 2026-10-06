import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MyAppsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: apps } = await supabase
    .from("apps")
    .select("*")
    .eq("developer_id", user.id)
    .order("created_at", { ascending: false });

  const statusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Apps Zangu</h1>
        <Link
          href="/developer/upload"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium"
        >
          + Pakia Mpya
        </Link>
      </div>

      {!apps || apps.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-gray-500">Bado hujapakia app yoyote.</p>
          <Link
            href="/developer/upload"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium"
          >
            Pakia App Ya Kwanza
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                {app.icon_url ? (
                  <img
                    src={app.icon_url}
                    alt={app.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">
                    📱
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{app.name}</h3>
                <p className="text-sm text-gray-500">
                  v{app.version_name} • {app.downloads_count || 0} downloads
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                  app.status
                )}`}
              >
                {app.status}
              </span>

              {app.status === "approved" && (
                <Link
                  href={`/app/${app.slug}`}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  View
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
