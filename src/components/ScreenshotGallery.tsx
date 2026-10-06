"use client";

import { useState } from "react";

export default function ScreenshotGallery({
  screenshots,
  appName,
}: {
  screenshots: { id: string; image_url: string }[];
  appName: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-40 h-72 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm"
          >
            Hakuna screenshot
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
        {screenshots.map((ss) => (
          <button
            key={ss.id}
            type="button"
            onClick={() => setSelected(ss.image_url)}
            className="flex-shrink-0 snap-start focus:outline-none"
          >
            <img
              src={ss.image_url}
              alt={`${appName} screenshot`}
              className="w-40 sm:w-48 h-72 sm:h-80 object-cover rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition cursor-pointer"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-3xl font-light hover:opacity-80"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
          <img
            src={selected}
            alt="Screenshot"
            className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
