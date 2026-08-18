import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import type { ResourceBrowserProps } from "../browser.types";
import { BrowserEmptyState } from "./browser-empty-state";
import { BrowserErrorState } from "./browser-error-state";
import { BrowserLoadingState } from "./browser-loading-state";

export function ResourceBrowser({
  breadcrumbs,
  capabilities,
  hasResource,
  isError,
  isLoading,
  items,
  title,
}: ResourceBrowserProps) {
  const breadcrumbItems = breadcrumbs.length
    ? breadcrumbs
    : [{ id: "root", name: title }];

  return (
    <section className="flex min-h-full w-full flex-col">
      <header className="px-6 pt-4 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList className="overflow-x-auto whitespace-nowrap">
            {breadcrumbItems.map((breadcrumb) => (
              <BreadcrumbItem key={breadcrumb.id}>
                <BreadcrumbPage className="truncate">
                  {breadcrumb.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4 border-b" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-6 py-5 lg:px-8">
        {isLoading ? <BrowserLoadingState /> : null}

        {!isLoading && (isError || !hasResource) ? <BrowserErrorState /> : null}

        {!isLoading && !isError && hasResource ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between py-1">
              <p className="text-sm text-muted-foreground">
                {items.length ? `${items.length} items` : null}
              </p>
            </div>

            {items.length ? (
              <div className="overflow-hidden rounded-lg border">
                <div className="grid grid-cols-[1fr_auto] border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                  <span>Name</span>
                  <span>Updated</span>
                </div>
                {items.map((item) => (
                  <div
                    className="grid grid-cols-[1fr_auto] items-center gap-4 border-b px-4 py-3 last:border-b-0"
                    key={`${item.type}-${item.id}`}
                  >
                    <span className="truncate text-sm font-medium">
                      {item.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <BrowserEmptyState capabilities={capabilities} />
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
