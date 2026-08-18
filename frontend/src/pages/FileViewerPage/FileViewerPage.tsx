import { ArrowLeft, FileText, RefreshCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fileViewUrlQueryOptions } from "@/features/files/file-queries";

type FileViewerLocationState = {
  fileName?: string;
};

function getFileNameFromState(state: unknown) {
  if (
    typeof state === "object" &&
    state !== null &&
    "fileName" in state &&
    typeof state.fileName === "string"
  ) {
    return state.fileName;
  }

  return "PDF file";
}

export function FileViewerPage() {
  const { fileId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const viewUrlQuery = useQuery(fileViewUrlQueryOptions(fileId));
  const fileName = getFileNameFromState(
    location.state as FileViewerLocationState | null,
  );

  return (
    <section className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
        <Button
          className="shrink-0 px-0 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
          type="button"
          variant="link"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Back
        </Button>
        <div className="flex min-w-0 items-center gap-3 border-l pl-4">
          <FileText
            aria-hidden
            className="h-4 w-4 shrink-0 text-muted-foreground"
          />
          <h1 className="truncate text-sm font-medium text-foreground">
            {fileName}
          </h1>
        </div>
      </header>

      <div className="h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden bg-muted/30">
        {viewUrlQuery.isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading PDF...
          </div>
        ) : null}

        {viewUrlQuery.isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div>
              <p className="font-medium text-foreground">
                This PDF is unavailable
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                It may have been deleted, is still uploading, or you no longer
                have access.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  void viewUrlQuery.refetch();
                }}
                type="button"
                variant="outline"
              >
                <RefreshCcw aria-hidden className="h-4 w-4" />
                Retry
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link to="/">Go home</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {viewUrlQuery.data ? (
          <iframe
            className="h-full w-full"
            src={viewUrlQuery.data.url}
            title={fileName}
          />
        ) : null}
      </div>
    </section>
  );
}
