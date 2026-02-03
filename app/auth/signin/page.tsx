// app/auth/signin/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
  
    // next-auth credentials sign-in (we used redirect: false to handle UI)
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    } as any);
  
    setBusy(false);
  
    if (!res) {
      setError("Unknown error — try again.");
      return;
    }
  
    if (res.error) {
      setError("Invalid email or password.");
      return;
    }
  
    // success -> go straight to admin dashboard
    router.push("/admin");
  }
  

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <h1 style={{ margin: 0 }}>Roll<span style={{ color: "#ffd166" }}>Academy</span></h1>
          <p style={{ margin: "6px 0 0", opacity: 0.85 }}>Admin Portal</p>
        </div>

        <div style={styles.hero}>
          <h2 style={{ margin: 0 }}>Welcome back</h2>
          <p style={{ marginTop: 8, color: "#e6eef8" }}>
            Securely manage courses, upload videos, and control staff access.
          </p>
          <div style={styles.pulse} aria-hidden />
        </div>
      </div>

      <main style={styles.cardWrap}>
        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>Sign in to your admin account</h3>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <label style={styles.label}>
              Email
              <input
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
              />
            </label>

            <label style={styles.label}>
              Password
              <div style={styles.inputWrap}>
                <input
                  style={{ ...styles.input, paddingRight: 110 }}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={styles.pwToggle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div style={styles.row}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember((r) => !r)}
                />
                Remember me
              </label>

              <a href="#" style={styles.link}>Forgot password?</a>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" style={styles.submit} disabled={busy}>
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div style={styles.footer}>
            <small style={{ color: "#555" }}>
              Not an admin? <a href="/" style={styles.link}>Return to site</a>
            </small>
          </div>
        </div>

        <footer style={{ marginTop: 16, textAlign: "center", color: "#666" }}>
          © {new Date().getFullYear()} Roll Academy
        </footer>
      </main>
    </div>
  );
}

// Inline styles (single-file, easy to paste)
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background:
      "linear-gradient(135deg, #0f172a 0%, #111827 40%, #0b1220 100%)",
    color: "white",
    alignItems: "stretch",
  },
  left: {
    flex: 1,
    padding: 48,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 24,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00))",
  },
  brand: {
    color: "#dbeafe",
  },
  hero: {
    maxWidth: 520,
  },
  pulse: {
    marginTop: 18,
    width: 64,
    height: 64,
    borderRadius: 999,
    background:
      "radial-gradient(circle at 30% 30%, rgba(255,209,102,0.18), rgba(255,209,102,0.06))",
    filter: "blur(22px)",
  },

  /* RIGHT / FORM AREA */
  cardWrap: {
    width: 460,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 48,
    background: "linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)",
    color: "#0b1220",
    boxShadow: "0 10px 30px rgba(2,6,23,0.4)",
  },
  card: {
    background: "white",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 6px 20px rgba(2,6,23,0.06)",
  },

  /* INPUTS */
  label: { display: "block", fontSize: 13, color: "#333" },
  inputWrap: {
    position: "relative",
    display: "block",
    width: "100%",
  },
  input: {
    width: "100%",
    marginTop: 6,
    padding: "12px 12px",
    height: 44,
    borderRadius: 8,
    border: "1px solid #e6eef8",
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box",
  },

  pwToggle: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "#eef3ff",
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    height: 32,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  link: { color: "#0b63f6", textDecoration: "none", fontSize: 13 },
  submit: {
    marginTop: 2,
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    background: "linear-gradient(90deg,#0369a1,#0891b2)",
    color: "white",
    border: "none",
    fontWeight: 600,
    fontSize: 15,
  },
  footer: { marginTop: 12, textAlign: "center" },
  error: {
    background: "#fff4f4",
    color: "#9b1c1c",
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
  },
};
