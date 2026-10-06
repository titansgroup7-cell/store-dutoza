import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteAppButton from "@/components/DeleteAppButton";

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
      case "blocked":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Imeidhinishwa";
      case "pending":
        return "Inasubiri";
      case "rejected":
        return "Imekataliwa";
      case "blocked":
        return "Imezuiwa";
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
          Apps Zangu
        </h1>
        <Link
          href="/developer/upload"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-medium"
        >
          + Pakia Mpya
        </Link>
      </div>

      {!apps || apps.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-500 text-xs">Bado hujapakia app yoyote.</p>
          <Link
            href="/developer/upload"
            className="inline-block mt-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-[11px] font-medium"
          >
            Pakia App Ya Kwanza
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {apps.map((app) => (
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
                <h3 className="font-semibold text-gray-900 text-[13px] truncate">
                  {app.name}
                </h3>
                <p className="text-[11px] text-gray-500">
                  v{app.version_name} • {app.downloads_count || 0} downloads
                </p>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${statusColor(
                  app.status
                )}`}
              >
                {statusLabel(app.status)}
              </span>

              {app.status === "approved" && (
                <Link
                  href={`/app/${app.slug}`}
                  className="text-blue-600 text-[11px] font-medium hover:underline whitespace-nowrap"
                >
                  View
                </Link>
              )}

              <DeleteAppButton appId={app.id} appName={app.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
