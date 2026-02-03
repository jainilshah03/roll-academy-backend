"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load video
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/videos/${id}`);
        if (!res.ok) throw new Error("Failed to load video");

        const data = await res.json();
        setVideo(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load");
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: "PATCH", // FIXED — backend expects PATCH
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(video),
      });

      if (!res.ok) throw new Error("Failed to save");

      router.push("/admin/videos");
    } catch (err) {
      console.error(err);
      setError("Save failed");
      setSaving(false);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!video) return <p>No data</p>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Edit Video</h2>

      {error && (
        <p style={{ color: "red", marginBottom: 10 }}>{error}</p>
      )}

      <form onSubmit={handleSave} style={{ display: "grid", gap: 14 }}>
        {/* Title */}
        <label style={{ display: "grid", gap: 4 }}>
          <span>Title</span>
          <input
            value={video.title}
            onChange={(e) => setVideo({ ...video, title: e.target.value })}
            style={inputStyle}
            required
          />
        </label>

        {/* URL */}
        <label style={{ display: "grid", gap: 4 }}>
          <span>Video URL</span>
          <input
            value={video.url}
            onChange={(e) => setVideo({ ...video, url: e.target.value })}
            style={inputStyle}
            required
          />
        </label>

        {/* Description */}
        <label style={{ display: "grid", gap: 4 }}>
          <span>Description</span>
          <textarea
            value={video.description ?? ""}
            onChange={(e) =>
              setVideo({ ...video, description: e.target.value })
            }
            rows={4}
            style={{
              ...inputStyle,
              resize: "vertical",
              paddingTop: 10,
            }}
          />
        </label>

        {/* Visibility */}
        <label style={{ display: "grid", gap: 4 }}>
          <span>Visibility</span>
          <select
            value={video.visibility}
            onChange={(e) =>
              setVideo({ ...video, visibility: e.target.value })
            }
            style={inputStyle}
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </label>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="submit"
            disabled={saving}
            style={saveBtnStyle}
          >
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/videos")}
            style={cancelBtnStyle}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/** — UI Styles — **/
const inputStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
};

const saveBtnStyle: React.CSSProperties = {
  padding: "10px 18px",
  background: "linear-gradient(90deg, #0284c7, #0ea5e9)",
  color: "white",
  borderRadius: 999,
  fontSize: 14,
  border: "none",
  cursor: "pointer",
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "10px 18px",
  background: "#f3f4f6",
  color: "#374151",
  borderRadius: 999,
  fontSize: 14,
  border: "1px solid #e5e7eb",
  cursor: "pointer",
};
