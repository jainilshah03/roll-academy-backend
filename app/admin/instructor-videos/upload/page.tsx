"use client";

import { useState, useEffect, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { uploadVideoToR2 } from "@/lib/uploadVideoToR2";

interface Instructor {
  id: string;
  name: string;
}

type Visibility = "PUBLIC" | "PRIVATE";

export default function UploadInstructorVideoPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);

  const [angleA, setAngleA] = useState<File | null>(null);
  const [angleB, setAngleB] = useState<File | null>(null);
  const [angleC, setAngleC] = useState<File | null>(null);
  const [angleD, setAngleD] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  /* ================= LOAD INSTRUCTORS ================= */
  useEffect(() => {
    async function fetchInstructors() {
      try {
        setLoadingInstructors(true);
        const res = await fetch("/api/instructors", { cache: "no-store" });
        if (!res.ok) throw new Error();
        setInstructors(await res.json());
      } catch {
        setError("Failed to load instructors");
      } finally {
        setLoadingInstructors(false);
      }
    }

    fetchInstructors();
  }, []);

  /* ================= SUBMIT ================= */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const hasMultiAngle = angleA && angleB && angleC && angleD;
    const hasSingle = file;

    if (!title.trim() || (!hasMultiAngle && !hasSingle)) {
      alert("Upload either ONE video or ALL four angles (A, B, C, D)");
      return;
    }

    if (!selectedInstructorId) {
      alert("Please select an instructor");
      return;
    }

    try {
      setBusy(true);
      setError(null);

      const payload: any = {
        title: title.trim(),
        instructorId: selectedInstructorId,
        visibility,
      };

      // ✅ MULTI-ANGLE (FIXED)
      if (hasMultiAngle) {
        const [A, B, C, D] = await Promise.all([
          uploadVideoToR2(angleA!, "instructors"),
          uploadVideoToR2(angleB!, "instructors"),
          uploadVideoToR2(angleC!, "instructors"),
          uploadVideoToR2(angleD!, "instructors"),
        ]);

        payload.angles = { A, B, C, D };
      }
      // ✅ SINGLE VIDEO (FIXED)
      else if (file) {
        payload.url = await uploadVideoToR2(file, "instructors");
      }

      const res = await fetch("/api/admin/instructor-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Upload failed");

      // ✅ CORRECT PATH
      router.push("/admin/instructor-videos");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while uploading.");
      setBusy(false);
    }
  }

  /* ================= UI (UNCHANGED) ================= */

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Upload Instructor Video</h2>
          <p style={styles.subtitle}>
            Upload single or multi-angle instructor content.
          </p>
        </div>
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
            Instructor
            <select
              style={styles.select}
              value={selectedInstructorId}
              onChange={(e) => setSelectedInstructorId(e.target.value)}
              disabled={busy || loadingInstructors}
              required
            >
              <option value="">
                {loadingInstructors
                  ? "Loading instructors..."
                  : "Select instructor..."}
              </option>
              {instructors.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Visibility
            <select
              style={styles.select}
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              disabled={busy}
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </label>

          <label style={styles.label}>
            Video file(s) single video
            <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

            Multiple videos angles
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
              onClick={() => router.push("/admin/instructor-videos")}
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
  headerRow: {},
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
  select: { height: 42, borderRadius: 10, padding: "0 12px" },
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
