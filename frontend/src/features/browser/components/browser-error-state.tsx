import { FileText } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function BrowserErrorState() {
  return (
    <Empty className="min-h-0 flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText aria-hidden />
        </EmptyMedia>
        <EmptyTitle>This item is unavailable</EmptyTitle>
        <EmptyDescription>
          It may have been deleted or your access may have been removed.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
