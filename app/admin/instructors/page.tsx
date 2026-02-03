"use client";

export const dynamic = "force-dynamic";
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Instructor = {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  avatar?: string | null;
};

export default function AdminInstructorsPage() {
  const router = useRouter();

  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // auto-generate slug
  useEffect(() => {
    if (!name) return setSlug("");
    setSlug(
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  }, [name]);

  async function fetchInstructors() {
    try {
      setLoadingList(true);
      const res = await fetch("/api/instructors", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setInstructors(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchInstructors();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setBusy(true);
      setError(null);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("slug", slug);
      formData.append("bio", bio);
      if (avatar) formData.append("avatar", avatar);

      await fetch("/api/admin/instructors", {
        method: "POST",
        body: formData,
      });

      setName("");
      setSlug("");
      setBio("");
      setAvatar(null);

      fetchInstructors();
    } catch {
      setError("Failed to create instructor.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* HEADER */}
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Create instructor</h2>
        <p style={styles.subtitle}>
          Instructors act as public profiles where videos are published.
        </p>
      </div>

      {/* CREATE CARD */}
      <div style={styles.card}>
        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Instructor name
            <input
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
              required
            />
          </label>

          <label style={styles.label}>
            Instructor URL
            <div style={styles.slugRow}>
              <span style={styles.slugPrefix}>/instructors/</span>
              <input style={styles.slugInput} value={slug} readOnly />
            </div>
          </label>

          <label style={styles.label}>
            Bio
            <textarea
              style={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={busy}
            />
          </label>

          <label style={styles.label}>
            Profile photo
            <input
              type="file"
              accept="image/*"
              style={styles.fileInput}
              onChange={(e) =>
                setAvatar(e.target.files?.[0] || null)
              }
            />
          </label>

          <button style={styles.primaryBtn} disabled={busy}>
            {busy ? "Creating…" : "Create instructor"}
          </button>
        </form>
      </div>

      {/* ADMIN LIST */}
      <div style={styles.card}>
        <h3>All instructors</h3>

        {loadingList && <p>Loading…</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {instructors.map((i) => (
            <li
              key={i.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div>
                <strong>{i.name}</strong>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  /instructors/{i.slug}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={styles.secondaryBtn}
                  onClick={() =>
                    router.push(`/admin/instructors/edit/${i.id}`)
                  }
                >
                  Edit
                </button>

                <button
                  style={{ ...styles.secondaryBtn, color: "#b91c1c" }}
                  onClick={async () => {
                    if (!confirm("Delete instructor?")) return;
                    await fetch(`/api/admin/instructors/${i.id}`, {
                      method: "DELETE",
                    });
                    fetchInstructors();
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* STYLES */
const styles: Record<string, CSSProperties> = {
  wrapper: { maxWidth: 720, display: "flex", flexDirection: "column", gap: 18 },
  headerRow: {},
  title: { fontSize: 20, fontWeight: 600 },
  subtitle: { fontSize: 13, color: "#6b7280" },
  card: {
    background: "white",
    padding: 20,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
  },
  errorBox: { background: "#fee2e2", padding: 10, borderRadius: 10 },
  form: { display: "grid", gap: 14 },
  label: { fontSize: 13, display: "flex", flexDirection: "column", gap: 6 },
  input: { height: 40 },
  textarea: { height: 80 },
  slugRow: { display: "flex", border: "1px solid #e5e7eb" },
  slugPrefix: { padding: "0 8px" },
  slugInput: { border: "none", flex: 1 },
  fileInput: {},
  primaryBtn: { padding: "8px 16px" },
  secondaryBtn: { padding: "6px 12px" },
};
