import { useAuth } from "@/features/auth/use-auth";

export function HomePage() {
  const { user } = useAuth();

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Signed in as {user?.email}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          My Data Room
        </h1>
      </div>

      <div className="rounded-lg border bg-muted/20 px-6 py-10 text-center">
        <h2 className="text-lg font-semibold tracking-tight">
          Workspace ready
        </h2>
      </div>
    </section>
  );
}
