import { Folder, LogOut, Users } from "lucide-react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/use-auth";
import { cn } from "@/lib/utils";

export function AuthenticatedAppLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r bg-muted/20 px-4 py-5 md:flex md:flex-col">
        <div className="px-2 text-lg font-semibold tracking-tight">
          Data Room
        </div>

        <nav className="mt-8 space-y-1">
          <NavLink
            className={({ isActive }) =>
              cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground",
                isActive && "bg-background text-foreground shadow-sm",
              )
            }
            to="/"
          >
            <Folder aria-hidden className="h-4 w-4" />
            My Data Room
          </NavLink>

          <button
            className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-muted-foreground"
            disabled
            type="button"
          >
            <Users aria-hidden className="h-4 w-4" />
            Shared with me
          </button>
        </nav>

        <div className="mt-auto border-t pt-4">
          <div className="px-2">
            <p className="truncate text-sm font-medium">
              {user?.name ?? user?.email}
            </p>
            {user?.name ? (
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            ) : null}
          </div>
          <button
            className="mt-3 flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => {
              void logout();
            }}
            type="button"
          >
            <LogOut aria-hidden className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 md:hidden">
          <p className="font-semibold tracking-tight">Data Room</p>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => {
              void logout();
            }}
            title="Sign out"
            type="button"
          >
            <LogOut aria-hidden className="h-4 w-4" />
          </button>
        </header>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
