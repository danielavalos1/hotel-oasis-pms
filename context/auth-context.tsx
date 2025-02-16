"use client";
import { createContext, useContext } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { Session } from "next-auth";

const AuthContext = createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
  session: ReturnType<typeof useSession>["data"];
}>({
  isAuthenticated: false,
  isLoading: true,
  session: null,
});

function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

interface AuthProviderProps {
  children: React.ReactNode;
  session: Session | null;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session}>
      <AuthStateProvider>{children}</AuthStateProvider>
    </SessionProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
