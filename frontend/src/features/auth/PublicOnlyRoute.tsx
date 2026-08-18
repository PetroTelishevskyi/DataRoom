import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./use-auth";

export function PublicOnlyRoute() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
        <p className="text-sm font-medium text-muted-foreground">Data Room</p>
      </main>
    );
  }

  if (user) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
}
