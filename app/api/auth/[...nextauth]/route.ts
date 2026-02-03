import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: any) {
        if (!credentials) return null;

        const email = credentials.email?.trim().toLowerCase();
        const password = credentials.password;

        if (!email || !password) return null;

        // 🔍 Find user by email only
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        // 🔐 Check password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // 🔒 Admin-only access
        if (user.role !== "ADMIN") return null;

        // ✅ Auth success
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          gymId: user.gymId,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.gymId = user.gymId;
      }
      return token;
    },

    async session({ session, token }: any) {
      (session as any).user = {
        id: token.id,
        email: session.user?.email,
        role: token.role,
        gymId: token.gymId,
      };
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
