export const dynamic = "force-dynamic";

import type { ReactNode, CSSProperties } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <span style={styles.logoDot} />
          <div>
            <div style={styles.brandTitle}>
              Roll<span style={{ color: "#facc15" }}>Academy</span>
            </div>
            <div style={styles.brandSubtitle}>Admin Console</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <Link href="/admin" style={styles.navItem}>📊 Dashboard</Link>
          <Link href="/admin/videos/upload" style={styles.navItem}>➕ Upload Video</Link>
          <Link href="/admin/videos" style={styles.navItem}>🎞️ Manage Videos</Link>
          <Link href="/admin/instructors" style={styles.navItem}>👨‍🏫 Instructors</Link>
          <Link href="/admin/users" style={styles.navItem}>👥 Users</Link>
          <Link href="/admin/gyms" style={styles.navItem}>🏋️ Gyms</Link>
          <Link href="/admin/subscriptions" style={styles.navItem}>💳 Subscriptions</Link>
          <Link href="/admin/instructor-videos/upload" style={styles.navItem}>👨‍💼Upload instructor vidoes</Link>
          <Link href="/admin/instructor-videos" style={styles.navItem}>😈Manage instructor videos</Link>
          <Link href="/admin/contact" style={styles.navItem}>📇Enquiry</Link>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.sidebarHint}>
            <div style={{ fontSize: 12 }}>Quick Tip</div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
              Upload new lessons regularly to keep engagement high.
            </div>
          </div>

          <Link href="/" style={styles.backBtn}>
            ← Back to Website
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <div style={styles.mainArea}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Admin Dashboard</h1>
            <p style={styles.headerSubtitle}>
              Manage instructors, videos, and users in one place
            </p>
          </div>

          <div style={styles.adminBadge}>
            <span style={styles.greenDot} />
            Signed in as admin
          </div>
        </header>

        {/* 🔥 IMPORTANT CHANGE */}
        <main style={styles.content}>
          {children}
        </main>

        <footer style={styles.footer}>
          © {new Date().getFullYear()} Roll Academy • Admin
        </footer>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "#020617",
  },

  sidebar: {
    width: 260,
    padding: "24px 20px",
    background: "#020617",
    color: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: 24,
    borderRight: "1px solid rgba(148,163,184,0.25)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px",
    borderRadius: 999,
    background: "rgba(30,41,59,0.6)",
  },

  logoDot: {
    width: 26,
    height: 26,
    borderRadius: 999,
    background: "radial-gradient(circle,#facc15,#ea580c)",
  },

  brandTitle: { fontSize: 16, fontWeight: 700 },
  brandSubtitle: { fontSize: 11, opacity: 0.7 },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 10,
  },

  navItem: {
    padding: "10px 14px",
    borderRadius: 12,
    fontSize: 14,
    color: "#e5e7eb",
    textDecoration: "none",
    background: "rgba(15,23,42,0.6)",
    transition: "all 0.25s ease",
  },

  sidebarFooter: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  sidebarHint: {
    padding: 12,
    borderRadius: 12,
    border: "1px dashed rgba(148,163,184,0.4)",
    background: "rgba(15,23,42,0.8)",
  },

  backBtn: {
    padding: "10px",
    borderRadius: 12,
    background: "linear-gradient(90deg,#facc15,#fde047)",
    color: "#0f172a",
    textAlign: "center",
    fontWeight: 600,
    textDecoration: "none",
  },

  mainArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#f1f5f9",
    minWidth: 0, // 🔥 VERY IMPORTANT
  },

  header: {
    padding: "20px 28px",
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e7eb",
  },

  headerTitle: { margin: 0, fontSize: 20, fontWeight: 600 },
  headerSubtitle: { margin: 0, fontSize: 13, color: "#6b7280" },

  adminBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    background: "#ecfdf3",
    padding: "6px 10px",
    borderRadius: 999,
    color: "#166534",
  },

  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "#22c55e",
  },

  // 🔥 FIXED CONTENT AREA
  content: {
    flex: 1,
    width: "100%",
    overflowX: "auto",
    padding: 0,           // ❗ NO FORCED PADDING
    background: "#f1f5f9",
  },

  footer: {
    padding: "10px 28px",
    fontSize: 11,
    color: "#6b7280",
    borderTop: "1px solid #e5e7eb",
  },
};
