import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { SharedResourceTable } from "@/features/sharing/components/shared-resource-table";

export function SharedWithMePage() {
  return (
    <section className="flex min-h-full w-full flex-col">
      <header className="px-6 pt-4 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList className="overflow-x-auto whitespace-nowrap">
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate">Shared with me</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4 border-b" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-6 py-6 lg:px-8">
        <SharedResourceTable />
      </div>
    </section>
  );
}
