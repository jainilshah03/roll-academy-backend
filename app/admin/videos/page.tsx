"use client";

export const dynamic = "force-dynamic";


import Link from "next/link";
import { useEffect, useState } from "react";

/* ================= TYPES ================= */

type Gym = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name?: string;
  email: string;
};

type Video = {
  id: string;
  title: string;
  url: string;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;

  gymId?: string | null;
  targetUserId?: string | null;

  gym?: Gym | null;
  targetUser?: User | null;
};

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedGymId, setSelectedGymId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH VIDEOS ================= */
  async function fetchVideos() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/videos", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch videos");

      const data = await res.json();
      setVideos(data);
      setFilteredVideos(data);
    } catch (err) {
      console.error(err);
      setError("Could not load videos. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ================= FETCH GYMS ================= */
  async function fetchGyms() {
    const res = await fetch("/api/gyms");
    if (res.ok) setGyms(await res.json());
  }

  /* ================= FETCH USERS BY GYM ================= */
  async function fetchUsersByGym(gymId: string) {
  try {
    const res = await fetch(`/api/admin/users/by-gym?gymId=${gymId}`, {
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to fetch users", await res.text());
      setUsers([]);
      return;
    }

    const data = await res.json();
    if (Array.isArray(data)) setUsers(data);
    else setUsers([]);
  } catch (err) {
    console.error("Users fetch error:", err);
    setUsers([]);
  }
}


  useEffect(() => {
    fetchVideos();
    fetchGyms();
  }, []);

  /* ================= HANDLE GYM CHANGE ================= */
  useEffect(() => {
    if (!selectedGymId) {
      setUsers([]);
      setSelectedUserId("");
    } else {
      fetchUsersByGym(selectedGymId);
    }
  }, [selectedGymId]);

  /* ================= APPLY FILTERS ================= */
  useEffect(() => {
    let data = [...videos];

    if (selectedGymId) {
      data = data.filter((v) => v.gymId === selectedGymId);
    }

    if (selectedUserId) {
      data = data.filter(
        (v: any) =>
          v.targetUserId === selectedUserId ||
          v.uploadedById === selectedUserId
      );
    }

    setFilteredVideos(data);
  }, [videos, selectedGymId, selectedUserId]);

  /* ================= DELETE ================= */
  async function handleDelete(id: string) {
    if (!confirm("Delete this video?")) return;

    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchVideos();
    } catch (err) {
      console.error(err);
      alert("Could not delete video. Try again.");
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* HEADER */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Video library</h2>
          <p style={styles.subtitle}>
            Manage uploaded lessons and filter by gym or student.
          </p>
        </div>

        <Link href="/admin/videos/upload" style={styles.primaryBtnLink}>
          <button style={styles.primaryBtn}>➕ Upload video</button>
        </Link>
      </div>

      {/* FILTER BAR */}
      <div style={styles.filterBar}>
        {/* GYM */}
        <select
          style={styles.select}
          value={selectedGymId}
          onChange={(e) => setSelectedGymId(e.target.value)}
        >
          <option value="">All gyms</option>
          {gyms.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {/* USER */}
        <select
          style={styles.select}
          value={selectedUserId}
          disabled={!selectedGymId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="">
            {selectedGymId ? "All students" : "Select gym first"}
          </option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name || u.email}
            </option>
          ))}
        </select>
      </div>

      {/* CARD */}
      <div style={styles.card}>
        {loading && <p>Loading videos…</p>}

        {!loading && error && (
          <div style={styles.errorBox}>
            {error}
            <button style={styles.retryBtn} onClick={fetchVideos}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredVideos.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>No videos found</p>
          </div>
        )}

        {!loading && !error && filteredVideos.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Access</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.thRight}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredVideos.map((v) => (
                  <tr key={v.id} style={styles.tr}>
                    <td style={styles.tdTitle}>
                      <div style={{ fontWeight: 500 }}>{v.title}</div>
                      <div style={styles.meta}>
                        {v.gym && <>🏋️ {v.gym.name}</>}
                        {v.targetUser && (
                          <> • 👤 {v.targetUser.name || v.targetUser.email}</>
                        )}
                      </div>
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

                        <Link href={`/admin/videos/${v.id}`}>
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
/* ⬇⬇⬇ UNCHANGED ⬇⬇⬇ */

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

  primaryBtnLink: { textDecoration: "none" },
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
    padding: 14,
    background: "#fef2f2",
    color: "#991b1b",
    borderRadius: 10,
  },

  retryBtn: {
    marginLeft: 10,
    padding: "6px 10px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
  },

  emptyState: { textAlign: "center", padding: 20 },
  emptyTitle: { fontSize: 16, fontWeight: 600 },

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
  tdTitle: { padding: "10px 8px" },
  tdRight: { padding: "10px 8px", textAlign: "right" },

  meta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },

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
