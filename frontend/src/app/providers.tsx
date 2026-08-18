import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toast/toaster";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { UploadPanel } from "@/features/uploads/components/upload-panel";
import { UploadProvider } from "@/features/uploads/UploadProvider";
import { queryClient } from "./query-client";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UploadProvider>
          {children}
          <UploadPanel />
        </UploadProvider>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
