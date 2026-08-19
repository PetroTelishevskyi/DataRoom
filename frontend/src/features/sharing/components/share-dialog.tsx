import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { NamedShareResource } from "../share.types";
import { AddUserShareForm } from "./add-user-share-form";
import { PeopleWithAccess } from "./people-with-access";

type ShareDialogProps = {
  children?: ReactNode;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  resource: NamedShareResource;
};

export function ShareDialog({
  children,
  disabled = false,
  onOpenChange,
  open,
  resource,
}: ShareDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const dialogOpen = open ?? internalOpen;

  function setDialogOpen(nextOpen: boolean) {
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      {children ? (
        <DialogTrigger asChild disabled={disabled}>
          {children}
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="break-words text-xl">
            Share &quot;{resource.name}&quot;
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5">
          <PeopleWithAccess resource={resource} />

          <div className="border-t" />

          <section className="grid gap-3">
            <h3 className="text-sm font-semibold">Add people</h3>
            <AddUserShareForm resource={resource} />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
