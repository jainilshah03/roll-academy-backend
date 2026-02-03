// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { Inter } from "next/font/google";
import SessionProvider from "./providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Roll Academy",
  description: "Roll Academy Admin Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={inter.className}
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #eef3f9 0%, #f8fafc 100%)",
        }}
      >
        {/* MINIMAL HEADER */}
        <header
          style={{
            padding: "18px 28px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid rgba(11,17,32,0.03)",
            background: "transparent",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg,#2563eb,#0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              R
            </div>
            <span
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: "#0b1220",
              }}
            >
              Roll Academy
            </span>
          </Link>
        </header>

        {/* FULLSCREEN MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SessionProvider>{children}</SessionProvider>
        </main>

        <footer
          style={{
            textAlign: "center",
            padding: "14px 8px",
            color: "#6b7280",
            fontSize: 13,
            borderTop: "1px solid rgba(11,17,32,0.03)",
          }}
        >
          © {new Date().getFullYear()} Roll Academy
        </footer>
      </body>
    </html>
  );
}
