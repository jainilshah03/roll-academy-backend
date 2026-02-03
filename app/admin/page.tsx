"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  totalVideos: number;
  instructors: number;
  students: number;
  gyms: number; // ✅ NEW
};

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch stats");
        setStats(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard Overview</h1>
        <p style={styles.subtitle}>
          Monitor platform activity and growth in real time
        </p>
      </div>

      {/* STATS */}
      <div style={styles.grid}>
        <StatCard
          title="Total Videos"
          value={stats?.totalVideos}
          loading={loading}
          gradient="linear-gradient(135deg,#6366f1,#8b5cf6)"
          icon="🎬"
        />

        {/* 👨‍🏫 INSTRUCTORS */}
        <Link href="/admin/instructors" style={styles.link}>
          <StatCard
            title="Instructors"
            value={stats?.instructors}
            loading={loading}
            gradient="linear-gradient(135deg,#10b981,#06b6d4)"
            icon="👨‍🏫"
            clickable
          />
        </Link>

        {/* 🎯 STUDENTS */}
        <Link href="/admin/users" style={styles.link}>
          <StatCard
            title="Active Students"
            value={stats?.students}
            loading={loading}
            gradient="linear-gradient(135deg,#f59e0b,#f97316)"
            icon="🎯"
            clickable
          />
        </Link>

        {/* 🏋️ GYMS */}
        <Link href="/admin/gyms" style={styles.link}>
          <StatCard
            title="Total Gyms"
            value={stats?.gyms}
            loading={loading}
            gradient="linear-gradient(135deg,#0ea5e9,#38bdf8)"
            icon="🏋️"
            clickable
          />
        </Link>
      </div>

      {/* ACTIVITY */}
      <div style={styles.activitySection}>
        <h3 style={styles.sectionTitle}>Recent Activity</h3>

        <div style={styles.activityCard}>
          <ActivityItem icon="📦" text="New videos uploaded recently" />
          <ActivityItem icon="👨‍🏫" text="Instructor onboarding ongoing" />
          <ActivityItem icon="🔥" text="Students actively joining sessions" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function StatCard({
  title,
  value,
  loading,
  gradient,
  icon,
  clickable,
}: {
  title: string;
  value?: number;
  loading: boolean;
  gradient: string;
  icon: string;
  clickable?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.statCard,
        background: gradient,
        cursor: clickable ? "pointer" : "default",
        transform: clickable ? "translateY(0)" : undefined,
      }}
    >
      <div style={styles.statTop}>
        <span style={styles.statIcon}>{icon}</span>
        <span style={styles.statTitle}>{title}</span>
      </div>

      <div style={styles.statValue}>
        {loading ? "—" : value ?? 0}
      </div>
    </div>
  );
}

function ActivityItem({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div style={styles.activityItem}>
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

/* ---------- Styles ---------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 32,
    display: "flex",
    flexDirection: "column",
    gap: 36,
    background: "#f1f5f9",
  },

  header: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748b",
    margin: 0,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 22,
  },

  link: {
    textDecoration: "none",
  },

  statCard: {
    borderRadius: 18,
    padding: "22px 24px",
    color: "white",
    boxShadow: "0 18px 40px rgba(0,0,0,0.15)",
    transition: "transform 0.15s ease",
  },

  statTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  statIcon: {
    fontSize: 20,
  },

  statTitle: {
    fontSize: 14,
    opacity: 0.9,
  },

  statValue: {
    fontSize: 36,
    fontWeight: 800,
    letterSpacing: -0.5,
  },

  activitySection: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#0f172a",
    margin: 0,
  },

  activityCard: {
    background: "white",
    borderRadius: 18,
    padding: 20,
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
  },

  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    color: "#334155",
  },
};
