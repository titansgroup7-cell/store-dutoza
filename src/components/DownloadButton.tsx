"use client";

import { useState, useRef } from "react";
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
  const [status, setStatus] = useState<
    "idle" | "downloading" | "paused" | "done" | "error"
  >("idle");
  const [percent, setPercent] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const chunksRef = useRef<Uint8Array[]>([]);
  const receivedRef = useRef(0);
  const totalRef = useRef(0);
  const pausedRef = useRef(false);
  const abortedRef = useRef(false);

  const finishDownload = () => {
    const blob = new Blob(chunksRef.current as BlobPart[]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appName.replace(/[^a-zA-Z0-9-_ ]/g, "") || "app"}.apk`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus("done");
    setPercent(100);
    setTimeout(() => {
      setStatus("idle");
      setPercent(0);
      setLoaded(0);
      setTotal(0);
      chunksRef.current = [];
      receivedRef.current = 0;
    }, 2000);
  };

  const readLoop = async () => {
    const reader = readerRef.current;
    if (!reader) return;

    try {
      while (true) {
        if (abortedRef.current) {
          try {
            await reader.cancel();
          } catch {}
          readerRef.current = null;
          return;
        }

        if (pausedRef.current) {
          return;
        }

        const { done, value } = await reader.read();
        if (done) {
          readerRef.current = null;
          finishDownload();
          return;
        }

        if (value) {
          chunksRef.current.push(value);
          receivedRef.current += value.length;
          setLoaded(receivedRef.current);
          if (totalRef.current > 0) {
            setPercent((receivedRef.current / totalRef.current) * 100);
          }
        }
      }
    } catch (err: any) {
      if (!abortedRef.current) {
        setError(err.message || "Download imeshindikana");
        setStatus("error");
      }
      readerRef.current = null;
    }
  };

  const startDownload = async () => {
    if (!apkUrl) {
      setError("APK URL haipo");
      return;
    }

    setStatus("downloading");
    setError("");
    setPercent(0);
    setLoaded(0);
    setTotal(0);
    chunksRef.current = [];
    receivedRef.current = 0;
    pausedRef.current = false;
    abortedRef.current = false;

    try {
      const res = await fetch(apkUrl);
      if (!res.ok) throw new Error("Imeshindikana kuanza download");

      const contentLength = res.headers.get("Content-Length");
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      totalRef.current = totalBytes;
      setTotal(totalBytes);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Browser haiauni download progress");

      readerRef.current = reader;
      await readLoop();
    } catch (err: any) {
      setError(err.message || "Download imeshindikana");
      setStatus("error");
      window.open(apkUrl, "_blank");
    }
  };

  const handlePause = () => {
    pausedRef.current = true;
    setStatus("paused");
  };

  const handleResume = async () => {
    if (status !== "paused" || !readerRef.current) return;
    pausedRef.current = false;
    setStatus("downloading");
    await readLoop();
  };

  const handleStop = async () => {
    abortedRef.current = true;
    pausedRef.current = false;
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch {}
      readerRef.current = null;
    }
    chunksRef.current = [];
    receivedRef.current = 0;
    setStatus("idle");
    setPercent(0);
    setLoaded(0);
    setTotal(0);
    setError("");
  };

  const isActive = status === "downloading" || status === "paused";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status === "idle" || status === "done" || status === "error" ? (
          <button
            type="button"
            onClick={startDownload}
            className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-10 py-3.5 rounded-full transition shadow-md shadow-blue-600/25 text-base"
          >
            Pakua APK
          </button>
        ) : (
          <>
            {status === "downloading" && (
              <button
                type="button"
                onClick={handlePause}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3.5 rounded-full transition text-base"
              >
                Pause
              </button>
            )}
            {status === "paused" && (
              <button
                type="button"
                onClick={handleResume}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3.5 rounded-full transition text-base"
              >
                Resume
              </button>
            )}
            <button
              type="button"
              onClick={handleStop}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3.5 rounded-full transition text-base"
            >
              Stop
            </button>
          </>
        )}
      </div>

      {isActive && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 max-w-sm">
          <ProgressBar
            percent={percent}
            loadedMB={formatMB(loaded)}
            totalMB={total > 0 ? formatMB(total) : "..."}
            label={status === "paused" ? "Imesimamishwa (Pause)" : "Inapakua..."}
          />
        </div>
      )}

      {status === "done" && (
        <p className="text-green-600 text-sm font-medium">
          Download imekamilika
        </p>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
