"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";

type Visibility = "PUBLIC" | "PRIVATE";

type InstructorVideo = {
  id: string;
  title: string;
  visibility: Visibility;
  instructor: { id: string; name: string };
  url?: string | null;
  angles?: Record<string, string> | null;
};

export default function EditInstructorVideoPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [video, setVideo] = useState<InstructorVideo | null>(null);
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [newAngles, setNewAngles] = useState<Record<string, File | null>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/instructor-videos/${id}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setVideo(data);
        setTitle(data.title);
        setVisibility(data.visibility);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    await fetch(`/api/admin/instructor-videos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        visibility,
        newAngles,
      }),
    });

    router.push("/admin/instructor-videos");
  }

  if (loading || !video) return <p style={{ padding: 40 }}>Loading…</p>;

  return (
    <div style={{ maxWidth: 640, padding: 40 }}>
      <h2>Edit Instructor Video</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label>
          Instructor
          <input value={video.instructor.name} readOnly />
        </label>

        <label>
          Visibility
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </label>

        {/* SINGLE VIDEO */}
        {video.url && (
          <video src={video.url} controls width={320} />
        )}

        {/* MULTI ANGLE */}
        {video.angles &&
          Object.entries(video.angles).map(([a, url]) => (
            <div key={a}>
              <p>Angle {a}</p>
              <video src={url} controls width={240} />
              <input
                type="file"
                accept="video/*"
                onChange={(e) =>
                  setNewAngles((p) => ({
                    ...p,
                    [a]: e.target.files?.[0] || null,
                  }))
                }
              />
            </div>
          ))}

        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
