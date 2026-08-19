import { ArrowLeft, FileText, RefreshCcw } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePublicFileViewUrl } from "@/features/sharing/hooks/use-public-file-view-url";

type PublicFileLocationState = {
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

export function PublicFilePage() {
  const { fileId = "", token = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const viewUrlQuery = usePublicFileViewUrl(token, fileId);
  const fileName = getFileNameFromState(
    location.state as PublicFileLocationState | null,
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
          <FileText aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
          <h1 className="truncate text-sm font-medium">{fileName}</h1>
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
                It may have been deleted or the link may have been disabled.
              </p>
            </div>
            <Button
              onClick={() => void viewUrlQuery.refetch()}
              type="button"
              variant="outline"
            >
              <RefreshCcw aria-hidden className="h-4 w-4" />
              Retry
            </Button>
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
