"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ================= TYPES ================= */

type Instructor = {
  id: string;
  name: string;
};

type Video = {
  id: string;
  title: string;
  url: string;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
  instructor?: Instructor | null;
};

/* ================= PAGE ================= */

export default function AdminInstructorVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);

  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH VIDEOS ================= */
  async function fetchVideos() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/instructor-videos", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch instructor videos");

      const data = await res.json();
      setVideos(data);
      setFilteredVideos(data);
    } catch (err) {
      console.error(err);
      setError("Could not load instructor videos");
    } finally {
      setLoading(false);
    }
  }

  /* ================= FETCH INSTRUCTORS ================= */
  async function fetchInstructors() {
    const res = await fetch("/api/instructors", { cache: "no-store" });
    if (res.ok) {
      setInstructors(await res.json());
    }
  }

  useEffect(() => {
    fetchVideos();
    fetchInstructors();
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    if (!selectedInstructorId) {
      setFilteredVideos(videos);
    } else {
      setFilteredVideos(
        videos.filter((v) => v.instructor?.id === selectedInstructorId)
      );
    }
  }, [videos, selectedInstructorId]);

  /* ================= DELETE ================= */
  async function handleDelete(id: string) {
    if (!confirm("Delete this instructor video?")) return;

    try {
      const res = await fetch(`/api/admin/instructor-videos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();
      fetchVideos();
    } catch (err) {
      console.error(err);
      alert("Failed to delete video");
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* HEADER */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Instructor Videos</h2>
          <p style={styles.subtitle}>
            Manage videos published on instructor channels
          </p>
        </div>

        <Link href="/admin/instructor-videos/upload">
          <button style={styles.primaryBtn}>➕ Upload Instructor Video</button>
        </Link>
      </div>

      {/* FILTER */}
      <div style={styles.filterBar}>
        <select
          style={styles.select}
          value={selectedInstructorId}
          onChange={(e) => setSelectedInstructorId(e.target.value)}
        >
          <option value="">All instructors</option>
          {instructors.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </div>

      {/* CARD */}
      <div style={styles.card}>
        {loading && <p>Loading instructor videos…</p>}

        {!loading && error && (
          <div style={styles.errorBox}>{error}</div>
        )}

        {!loading && !error && filteredVideos.length === 0 && (
          <p>No instructor videos found.</p>
        )}

        {!loading && !error && filteredVideos.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Instructor</th>
                  <th style={styles.th}>Visibility</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.thRight}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredVideos.map((v) => (
                  <tr key={v.id} style={styles.tr}>
                    <td style={styles.td}>{v.title}</td>

                    <td style={styles.td}>
                      {v.instructor?.name || "—"}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...(v.visibility === "PUBLIC"
                            ? styles.badgeGreen
                            : styles.badgeGray),
                        }}
                      >
                        {v.visibility}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {new Date(v.createdAt).toLocaleString()}
                    </td>

                    <td style={styles.tdRight}>
                      <div style={styles.actions}>
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.linkBtn}
                        >
                          Preview
                        </a>

                        <Link href={`/admin/instructor-videos/${v.id}`}>
                          <button style={styles.secondaryBtn}>Edit</button>
                        </Link>

                        <button
                          style={styles.dangerBtn}
                          onClick={() => handleDelete(v.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: "flex", flexDirection: "column", gap: 16 },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },

  title: { margin: 0, fontSize: 20, fontWeight: 600 },
  subtitle: { margin: "4px 0 0", fontSize: 13, color: "#6b7280" },

  primaryBtn: {
    padding: "9px 16px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#0284c7,#0ea5e9)",
    color: "white",
    cursor: "pointer",
  },

  filterBar: { display: "flex", gap: 12 },

  select: {
    height: 40,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    fontSize: 14,
  },

  card: {
    background: "white",
    borderRadius: 14,
    padding: 18,
    border: "1px solid #e5e7eb",
  },

  errorBox: {
    padding: 12,
    background: "#fef2f2",
    color: "#991b1b",
    borderRadius: 10,
  },

  table: { width: "100%", borderCollapse: "collapse" },

  th: {
    textAlign: "left",
    padding: "10px 8px",
    fontSize: 12,
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
  },

  thRight: {
    textAlign: "right",
    padding: "10px 8px",
    fontSize: 12,
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
  },

  tr: { borderBottom: "1px solid #f1f5f9" },

  td: { padding: "10px 8px" },
  tdRight: { padding: "10px 8px", textAlign: "right" },

  badge: {
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11,
  },

  badgeGreen: {
    background: "#ecfdf3",
    color: "#166534",
    border: "1px solid #bbf7d0",
  },

  badgeGray: {
    background: "#f3f4f6",
    color: "#4b5563",
    border: "1px solid #e5e7eb",
  },

  actions: { display: "inline-flex", gap: 8 },

  linkBtn: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    textDecoration: "none",
  },

  secondaryBtn: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "white",
  },

  dangerBtn: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #fecaca",
    background: "#fee2e2",
    color: "#991b1b",
  },
};
