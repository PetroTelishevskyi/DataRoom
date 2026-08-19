import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResourceShares } from "../hooks/use-resource-shares";
import type { ShareResource } from "../share.types";
import { UserShareRow } from "./user-share-row";

type PeopleWithAccessProps = {
  resource: ShareResource;
};

export function PeopleWithAccess({ resource }: PeopleWithAccessProps) {
  const sharesQuery = useResourceShares(resource);

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">People with access</h3>
        {sharesQuery.isFetching ? (
          <Loader2
            aria-label="Loading people with access"
            className="h-4 w-4 animate-spin text-muted-foreground"
          />
        ) : null}
      </div>

      {sharesQuery.isLoading ? (
        <div className="grid gap-2">
          <div className="h-12 rounded-md border bg-muted/40" />
          <div className="h-12 rounded-md border bg-muted/40" />
        </div>
      ) : null}

      {sharesQuery.isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm text-destructive">
            Unable to load people with access.
          </p>
          <Button
            className="mt-2 h-8 px-3"
            onClick={() => void sharesQuery.refetch()}
            type="button"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      ) : null}

      {sharesQuery.data?.length ? (
        <div className="grid gap-2">
          {sharesQuery.data.map((share) => (
            <UserShareRow key={share.id} share={share} />
          ))}
        </div>
      ) : null}

      {sharesQuery.data && sharesQuery.data.length === 0 ? (
        <div className="flex items-center gap-3 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          <Users aria-hidden className="h-4 w-4 shrink-0" />
          <span>No people have been added yet.</span>
        </div>
      ) : null}
    </section>
  );
}
