import { Loader2 } from "lucide-react";
import { FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast/use-toast";
import { ApiError } from "@/lib/api";
import { useCreateUserShare } from "../hooks/use-create-user-share";
import type { ShareResource } from "../share.types";

type AddUserShareFormProps = {
  resource: ShareResource;
};

function getShareErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.code === "RECIPIENT_NOT_FOUND") {
    return "No user exists with that email address.";
  }

  if (error instanceof ApiError && error.code === "CANNOT_SHARE_WITH_SELF") {
    return "You cannot share this item with yourself.";
  }

  if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
    return "Enter a valid email address.";
  }

  return "Unable to share this item.";
}

export function AddUserShareForm({ resource }: AddUserShareFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createUserShareMutation = useCreateUserShare();
  const inputId = useId();
  const errorId = useId();
  const isPending = createUserShareMutation.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const recipientEmail = email.trim();

    if (!recipientEmail) {
      setError("Email address is required.");
      return;
    }

    setError(null);

    try {
      await createUserShareMutation.mutateAsync({
        recipientEmail,
        resource,
        role: "VIEWER",
        type: "USER",
      });
      setEmail("");
      toast({
        title: "Access shared",
        description: `${recipientEmail} can now view this item.`,
      });
    } catch (error) {
      setError(getShareErrorMessage(error));
    }
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor={inputId}>Email address</Label>
        <Input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          autoComplete="email"
          className={
            error
              ? "border-destructive focus-visible:ring-destructive"
              : undefined
          }
          disabled={isPending}
          id={inputId}
          maxLength={255}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
          placeholder="viewer@example.com"
          type="email"
          value={email}
        />
        {error ? (
          <p className="text-xs text-destructive" id={errorId}>
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button disabled={isPending} type="submit">
          {isPending ? (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          ) : null}
          Share
        </Button>
      </div>
    </form>
  );
}
