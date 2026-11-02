export function formatDownloads(n?: number | null, plus = false) {
  const v = Number(n || 0);
  const s = plus ? "+" : "";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M" + s;
  if (v >= 1_000) return (v / 1_000).toFixed(1) + "K" + s;
  return String(v);
}

export function formatSize(bytes?: number | null) {
  if (!bytes) return "N/A";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

export function formatDate(d?: string | Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("sw-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(d?: string | Date | null) {
  if (!d) return "";
  const diff = Math.max(0, Date.now() - new Date(d).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "sasa hivi";
  if (m < 60) return `dakika ${m} zilizopita`;
  const h = Math.floor(m / 60);
  if (h < 24) return `saa ${h} zilizopita`;
  const days = Math.floor(h / 24);
  if (days < 30) return `siku ${days} zilizopita`;
  return formatDate(d);
}

export const STATUS_META: Record<string, { label: string; cls: string }> = {
  approved: { label: "Imeidhinishwa", cls: "badge-green" },
  pending: { label: "Inasubiri", cls: "badge-amber" },
  rejected: { label: "Imekataliwa", cls: "badge-red" },
  blocked: { label: "Imezuiwa", cls: "badge-orange" },
  open: { label: "Wazi", cls: "badge-amber" },
  answered: { label: "Imejibiwa", cls: "badge-green" },
  closed: { label: "Imefungwa", cls: "badge-slate" },
};

export function statusMeta(status: string) {
  return STATUS_META[status] || { label: status, cls: "badge-slate" };
}
