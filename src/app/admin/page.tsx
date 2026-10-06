import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ApproveButton from "@/components/ApproveButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500">Huna ruhusa ya kuingia hapa.</p>
      </div>
    );
  }

  const { data: pendingApps } = await supabase
    .from("apps")
    .select("*, profiles(full_name, username)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
      <p className="text-gray-500 mb-8">Approve au reject apps zinazosubiri</p>

      {!pendingApps || pendingApps.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-gray-500">Hakuna apps zinazosubiri idhini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingApps.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-gray-200 rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
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

                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    by {app.profiles?.full_name || app.profiles?.username} • v
                    {app.version_name}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {app.short_description}
                  </p>
                  {app.apk_url && (
                    <a
                      href={app.apk_url}
                      target="_blank"
                      className="text-blue-600 text-sm mt-2 inline-block hover:underline"
                    >
                      Download APK to test →
                    </a>
                  )}
                </div>

                <ApproveButton appId={app.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
