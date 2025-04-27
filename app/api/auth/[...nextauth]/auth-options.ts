import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@hoteloasis.mx",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] Intentando login con:", credentials);
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Faltan credenciales");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("[AUTH] Usuario no encontrado:", credentials.email);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          console.log("[AUTH] Contraseña incorrecta para:", credentials.email);
          return null;
        }

        // Ajuste de tipado para el nuevo modelo
        const result = {
          id: String(user.id),
          email: user.email,
          username: user.username,
          role: user.role || "",
        };
        console.log("[AUTH] Login exitoso:", result);
        return result;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("[AUTH] jwt callback user:", user);
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[AUTH] session callback token:", token);
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      console.log("[AUTH] session callback session:", session);
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
