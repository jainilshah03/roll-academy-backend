"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, FormEvent, CSSProperties } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditInstructorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =====================
     LOAD INSTRUCTOR
  ====================== */
  useEffect(() => {
    async function loadInstructor() {
      try {
        const res = await fetch(`/api/admin/instructors/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setName(data.name);
        setSlug(data.slug);
        setBio(data.bio || "");
        setCurrentAvatar(data.avatar || null);
      } catch (err) {
        setError("Instructor not found");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadInstructor();
  }, [id]);

  /* =====================
     AUTO UPDATE SLUG
  ====================== */
  useEffect(() => {
    if (!name) return;

    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setSlug(generatedSlug);
  }, [name]);

  /* =====================
     SAVE CHANGES
  ====================== */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug); // ✅ slug updates with name
    formData.append("bio", bio);
    if (avatar) formData.append("avatar", avatar);

    await fetch(`/api/admin/instructors/${id}`, {
      method: "PUT",
      body: formData,
    });

    router.push("/admin/instructors");
  }

  /* =====================
     STATES
  ====================== */
  if (loading) return <p style={{ padding: 40 }}>Loading instructor…</p>;

  if (error) {
    return (
      <div style={{ padding: 40 }}>
        <p>{error}</p>
        <button onClick={() => router.push("/admin/instructors")}>
          Back
        </button>
      </div>
    );
  }

  /* =====================
     UI
  ====================== */
  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h2 style={styles.title}>Edit Instructor</h2>
        <p style={styles.subtitle}>
          URL updates automatically when name changes
        </p>
      </div>

      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* NAME */}
          <label style={styles.label}>
            Instructor Name
            <input
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          {/* SLUG (READ ONLY) */}
          <label style={styles.label}>
            Public URL
            <div style={styles.slugRow}>
              <span style={styles.slugPrefix}>/instructors/</span>
              <input
                style={styles.slugInput}
                value={slug}
                readOnly
              />
            </div>
          </label>

          {/* BIO */}
          <label style={styles.label}>
            Bio
            <textarea
              style={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </label>

          {/* AVATAR */}
          <div style={styles.avatarRow}>
            <div style={styles.avatarBox}>
              {avatar ? (
                <img
                  src={URL.createObjectURL(avatar)}
                  style={styles.avatarImg}
                />
              ) : currentAvatar ? (
                <img src={currentAvatar} style={styles.avatarImg} />
              ) : (
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  No photo
                </span>
              )}
            </div>

            <label style={styles.uploadBtn}>
              Change Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  setAvatar(e.target.files?.[0] || null)
                }
              />
            </label>
          </div>

          {/* ACTIONS */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={() => router.push("/admin/instructors")}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={styles.primaryBtn}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =====================
   STYLES
====================== */

const styles: Record<string, CSSProperties> = {
  wrapper: { maxWidth: 720, padding: "32px 40px" },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 600 },
  subtitle: { fontSize: 13, color: "#6b7280" },

  card: {
    background: "white",
    borderRadius: 16,
    padding: 24,
    border: "1px solid #e5e7eb",
  },

  form: { display: "grid", gap: 16 },

  label: {
    fontSize: 13,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  input: {
    height: 42,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    padding: "0 12px",
  },

  textarea: {
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    padding: "8px 12px",
  },

  slugRow: {
    display: "flex",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#f9fafb",
  },

  slugPrefix: {
    padding: "0 10px",
    borderRight: "1px solid #e5e7eb",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
  },

  slugInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "0 10px",
    color: "#6b7280",
  },

  avatarRow: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },

  avatarBox: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    overflow: "hidden",
    border: "1px dashed #cbd5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  uploadBtn: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    fontSize: 13,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },

  primaryBtn: {
    padding: "9px 18px",
    borderRadius: 999,
    background: "linear-gradient(90deg,#0284c7,#0ea5e9)",
    color: "white",
    border: "none",
  },

  secondaryBtn: {
    padding: "9px 16px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
  },
};
