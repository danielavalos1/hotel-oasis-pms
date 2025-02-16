"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center gap-8 max-w-2xl text-center">
        <Image
          src="/assets/logo.webp"
          alt="Hotel Oasis Logo"
          width={200}
          height={80}
          priority
          className="mb-8"
        />

        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Bienvenido a Hotel Oasis
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Sistema de gestión hotelera integral
        </p>

        <div className="w-full max-w-md">
          {session ? (
            <a
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Ir al Dashboard
            </a>
          ) : (
            <a
              href="/login"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Iniciar Sesión
            </a>
          )}
        </div>
      </main>

      <footer className="mt-16 text-sm text-gray-500 dark:text-gray-400">
        © 2024 Hotel Oasis. Todos los derechos reservados.
      </footer>
    </div>
  );
}
