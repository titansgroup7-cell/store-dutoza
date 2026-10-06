"use client";

import { useState } from "react";
import ProgressBar from "./ProgressBar";

function formatMB(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2);
}

export default function DownloadButton({
  apkUrl,
  appName,
}: {
  apkUrl: string;
  appName: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (!apkUrl) return;
    setDownloading(true);
    setError("");
    setPercent(0);
    setLoaded(0);
    setTotal(0);

    try {
      const res = await fetch(apkUrl);
      if (!res.ok) throw new Error("Imeshindikana kupakua");

      const contentLength = res.headers.get("Content-Length");
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      setTotal(totalBytes);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Browser haiauni download progress");

      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          setLoaded(received);
          if (totalBytes > 0) {
            setPercent((received / totalBytes) * 100);
          }
        }
      }

      setPercent(100);
      const blob = new Blob(chunks as BlobPart[]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${appName.replace(/[^a-zA-Z0-9-_ ]/g, "")}.apk`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setTimeout(() => setDownloading(false), 1500);
    } catch (err: any) {
      setError(err.message || "Download imeshindikana");
      // Fallback: open direct link
      window.open(apkUrl, "_blank");
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 active:scale-[0.98] text-white font-semibold px-10 py-3.5 rounded-full transition shadow-md shadow-blue-600/25 text-base"
      >
        {downloading ? "Inapakua..." : "Pakua APK"}
      </button>

      {downloading && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 max-w-sm">
          <ProgressBar
            percent={percent}
            loadedMB={formatMB(loaded)}
            totalMB={total > 0 ? formatMB(total) : "..."}
            label="Download progress"
          />
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}
