"use client";

export default function ShareButton({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link imenakiliwa!");
      } catch {
        // ignore
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-full transition"
    >
      Share
    </button>
  );
}
