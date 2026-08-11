import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";
import { loginSchema } from "@/lib/validators";
import { authConfig } from "@/auth.config";
import { rateLimit } from "@/lib/api-helpers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = loginSchema.parse(credentials);

          const limited = rateLimit(`login:${parsed.email}`, 10, 60 * 1000);
          if (!limited.allowed) {
            throw new Error("RATE_LIMITED");
          }

          await dbConnect();

          const user = await User.findOne({ email: parsed.email });

          if (!user?.passwordHash) {
            return null;
          }

          const valid = await bcrypt.compare(parsed.password, user.passwordHash);

          if (!valid) {
            return null;
          }

          if (user.status === "blocked") {
            return null;
          }

          if (!user.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          user.lastLoginAt = new Date();
          await user.save();

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          } as { id: string; name: string; email: string; image?: string | null; role: string };
        } catch (error) {
          if (error instanceof ZodError) {
            return null;
          }
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        const existing = await User.findOne({ email: user.email });

        if (existing) {
          if (!existing.emailVerified) {
            existing.emailVerified = true;
            await existing.save();
          }
          return true;
        }

        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: true,
          role: "student",
        });
      }

      return true;
    },
  },
});
