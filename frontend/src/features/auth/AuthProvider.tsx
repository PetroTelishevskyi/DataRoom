import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "./auth-api";
import { AuthContext } from "./auth-context";
import type { AuthUser, LoginPayload, RegisterPayload } from "./auth.types";

let initialCurrentUserRequest: Promise<AuthUser | null> | null = null;

function getInitialCurrentUser() {
  initialCurrentUserRequest ??= getCurrentUser().catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  });

  return initialCurrentUserRequest;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getInitialCurrentUser()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          console.error(error);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const nextUser = await loginRequest(payload);
    setUser(nextUser);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const nextUser = await registerRequest(payload);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
    }),
    [isLoading, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
