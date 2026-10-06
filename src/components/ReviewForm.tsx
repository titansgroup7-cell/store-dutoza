"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ReviewForm({ appId }: { appId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Tafadhali ingia kwanza ili uache review.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("reviews").insert({
      app_id: appId,
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        setError("Tayari umeacha review kwa app hii.");
      } else {
        setError(insertError.message);
      }
      setLoading(false);
      return;
    }

    // Update rating average on apps table
    const { data: allReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("app_id", appId);

    if (allReviews && allReviews.length > 0) {
      const avg =
        allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
      await supabase
        .from("apps")
        .update({
          rating_average: Math.round(avg * 10) / 10,
          rating_count: allReviews.length,
        })
        .eq("id", appId);
    }

    setSuccess(true);
    setComment("");
    setRating(5);
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Rating yako</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="text-3xl transition-transform hover:scale-110"
            >
              <span
                className={
                  star <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Andika maoni yako kuhusu app hii..."
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-xl">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-xl">
          Review yako imehifadhiwa. Asante!
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition"
      >
        {loading ? "Inatuma..." : "Tuma Review"}
      </button>
    </form>
  );
}
