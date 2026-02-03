// app/admin/videos/upload/page.tsx
"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { uploadVideoToR2 } from "@/lib/uploadVideoToR2";

type Visibility = "PUBLIC" | "PRIVATE";

interface Gym {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function UploadPage() {
  // 🔹 EXISTING (single video – legacy)
  const [file, setFile] = useState<File | null>(null);

  // 🔹 MULTI-ANGLE
  const [angleA, setAngleA] = useState<File | null>(null);
  const [angleB, setAngleB] = useState<File | null>(null);
  const [angleC, setAngleC] = useState<File | null>(null);
  const [angleD, setAngleD] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedGymId, setSelectedGymId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingGyms, setLoadingGyms] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const router = useRouter();

  /* ================= FETCH GYMS ================= */
  useEffect(() => {
    async function fetchGyms() {
      try {
        setLoadingGyms(true);
        const res = await fetch("/api/gyms");
        if (!res.ok) throw new Error("Failed to fetch gyms");
        setGyms(await res.json());
      } catch {
        setError("Failed to load gyms.");
      } finally {
        setLoadingGyms(false);
      }
    }
    fetchGyms();
  }, []);

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    async function fetchUsers() {
      if (!selectedGymId) {
        setUsers([]);
        setSelectedUserId("");
        return;
      }

      try {
        setLoadingUsers(true);
        const res = await fetch(
          `/api/admin/users/by-gym?gymId=${selectedGymId}`
        );
        if (!res.ok) throw new Error("Failed to fetch users");
        setUsers(await res.json());
        setSelectedUserId("");
      } catch {
        setError("Failed to load users.");
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, [selectedGymId]);

  /* ================= SUBMIT ================= */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const hasMultiAngle = angleA && angleB && angleC && angleD;
    const hasSingle = file;

    if (!trimmedTitle || (!hasMultiAngle && !hasSingle)) {
      alert(
        "Please upload either a single video or all 4 angle videos (A, B, C, D)."
      );
      return;
    }

    if (!selectedGymId || !selectedUserId) {
      alert("Please select both a gym and a user.");
      return;
    }

    try {
      setBusy(true);
      setError(null);

      // 🔹 MULTI-ANGLE UPLOAD (R2)
      if (hasMultiAngle) {
        const [A, B, C, D] = await Promise.all([
          uploadVideoToR2(angleA!),
          uploadVideoToR2(angleB!),
          uploadVideoToR2(angleC!),
          uploadVideoToR2(angleD!),
        ]);

        const res = await fetch("/api/videos/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: trimmedTitle,
            description,
            visibility,
            gymId: selectedGymId,
            targetedId: selectedUserId,
            uploadedById: selectedUserId,
            angles: { A, B, C, D },
          }),
        });

        if (!res.ok) throw new Error("Upload failed");
      }

      // 🔹 SINGLE VIDEO UPLOAD (R2)
      else if (file) {
        const videoUrl = await uploadVideoToR2(file);

        const res = await fetch("/api/videos/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: trimmedTitle,
            description,
            visibility,
            gymId: selectedGymId,
            targetedId: selectedUserId,
            uploadedById: selectedUserId,
            url: videoUrl,
          }),
        });

        if (!res.ok) throw new Error("Upload failed");
      }

      router.push("/admin/videos");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while uploading.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div>
        <h2 style={styles.title}>Upload new video</h2>
        <p style={styles.subtitle}>
          Add a new lesson to your Roll Academy library.
        </p>
      </div>

      <div style={styles.card}>
        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Title
            <input
              style={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
              required
            />
          </label>

          <label style={styles.label}>
            Description
            <textarea
              style={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={busy}
              rows={3}
            />
          </label>

          <label style={styles.label}>
            Gym
            <select
              style={styles.select}
              value={selectedGymId}
              onChange={(e) => setSelectedGymId(e.target.value)}
              disabled={busy || loadingGyms}
              required
            >
              <option value="">Select a gym...</option>
              {gyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Student/User
            <select
              style={styles.select}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={busy || !selectedGymId || loadingUsers}
              required
            >
              <option value="">Select a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Visibility
            <select
              style={styles.select}
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as Visibility)
              }
              disabled={busy}
            >
              <option value="PRIVATE">Private</option>
              <option value="PUBLIC">Public</option>
            </select>
          </label>

          <label style={styles.label}>
            Single video
            <input
              type="file"
              accept="video/*"
              style={styles.fileInput}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={busy}
            />
          </label>

          <label style={styles.label}>
            Multi-angle (A, B, C, D)
            <input type="file" accept="video/*" onChange={(e) => setAngleA(e.target.files?.[0] || null)} />
            <input type="file" accept="video/*" onChange={(e) => setAngleB(e.target.files?.[0] || null)} />
            <input type="file" accept="video/*" onChange={(e) => setAngleC(e.target.files?.[0] || null)} />
            <input type="file" accept="video/*" onChange={(e) => setAngleD(e.target.files?.[0] || null)} />
          </label>

          <div style={styles.actionsRow}>
            <button type="submit" style={styles.primaryBtn} disabled={busy}>
              {busy ? "Uploading…" : "Upload video"}
            </button>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={() => router.push("/admin/videos")}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= STYLES (UNCHANGED) ================= */

const styles: Record<string, CSSProperties> = {
  wrapper: { display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 },
  title: { fontSize: 20, fontWeight: 600 },
  subtitle: { fontSize: 13, color: "#6b7280" },
  card: {
    background: "white",
    borderRadius: 14,
    padding: 20,
    border: "1px solid #e5e7eb",
  },
  errorBox: {
    padding: 10,
    background: "#fef2f2",
    color: "#991b1b",
    borderRadius: 10,
    fontSize: 13,
  },
  form: { display: "grid", gap: 14 },
  label: { fontSize: 13, display: "flex", flexDirection: "column", gap: 6 },
  input: { height: 42, borderRadius: 10, padding: "0 12px" },
  textarea: { borderRadius: 10, padding: "8px 12px" },
  select: { height: 42, borderRadius: 10, padding: "0 12px" },
  fileInput: { fontSize: 13 },
  actionsRow: { display: "flex", gap: 10 },
  primaryBtn: {
    padding: "9px 18px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#0284c7,#0ea5e9)",
    color: "white",
  },
  secondaryBtn: {
    padding: "9px 16px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "white",
  },
};
