import { SharedResourceTable } from "@/features/sharing/components/shared-resource-table";

export function SharedWithMePage() {
  return (
    <section className="flex min-h-full w-full flex-col px-6 py-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Shared with me
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resources shared with your account.
        </p>
      </header>

      <SharedResourceTable />
    </section>
  );
}
