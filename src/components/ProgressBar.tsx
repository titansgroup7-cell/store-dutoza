"use client";

export default function ProgressBar({
  percent,
  loadedMB,
  totalMB,
  label,
}: {
  percent: number;
  loadedMB: string;
  totalMB: string;
  label?: string;
}) {
  const pct = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full space-y-2">
      {label && (
        <p className="text-sm font-medium text-gray-700">{label}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {loadedMB} MB / {totalMB} MB
        </span>
        <span className="font-semibold text-blue-600">{pct.toFixed(0)}%</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">
        {pct < 100
          ? `Imebaki: ${(100 - pct).toFixed(0)}% · ${(
              parseFloat(totalMB) - parseFloat(loadedMB)
            ).toFixed(2)} MB`
          : "Imekamilika ✓"}
      </p>
    </div>
  );
}
