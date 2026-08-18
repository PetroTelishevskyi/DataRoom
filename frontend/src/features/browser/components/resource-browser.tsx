import { Fragment, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBrowserActions } from "@/features/browser/use-browser-actions";
import type { ResourceBrowserProps } from "../browser.types";
import { BrowserEmptyState } from "./browser-empty-state";
import { BrowserErrorState } from "./browser-error-state";
import { BrowserLoadingState } from "./browser-loading-state";
import { ResourceTable } from "./resource-table";

export function ResourceBrowser({
  breadcrumbs,
  capabilities,
  getBreadcrumbHref,
  getFolderHref,
  hasResource,
  isError,
  isLoading,
  items,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  rootHref,
  title,
}: ResourceBrowserProps) {
  const { setBrowserActions } = useBrowserActions();

  useEffect(() => {
    setBrowserActions({
      canCreateFolder: capabilities.canCreateFolder && hasResource && !isError,
      itemCount: hasResource && !isError ? items.length : null,
      onCreateFolder,
    });

    return () => {
      setBrowserActions({
        canCreateFolder: false,
        itemCount: null,
      });
    };
  }, [
    capabilities.canCreateFolder,
    hasResource,
    isError,
    items.length,
    onCreateFolder,
    setBrowserActions,
  ]);

  return (
    <section className="flex min-h-full w-full flex-col">
      <header className="px-6 pt-4 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList className="overflow-x-auto whitespace-nowrap">
            <BreadcrumbItem>
              {breadcrumbs.length ? (
                <BreadcrumbLink asChild>
                  <Link className="truncate" to={rootHref}>
                    {title}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="truncate">{title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {breadcrumbs.map((breadcrumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <Fragment key={breadcrumb.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="truncate">
                        {breadcrumb.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          className="truncate"
                          to={getBreadcrumbHref(breadcrumb)}
                        >
                          {breadcrumb.name}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4 border-b" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-6 py-5 lg:px-8">
        {isLoading ? <BrowserLoadingState /> : null}

        {!isLoading && (isError || !hasResource) ? <BrowserErrorState /> : null}

        {!isLoading && !isError && hasResource ? (
          <div className="flex min-h-0 flex-1 flex-col">
            {items.length ? (
              <ResourceTable
                canDeleteFolder={capabilities.canDeleteFolder}
                canRenameFolder={capabilities.canRenameFolder}
                getFolderHref={getFolderHref}
                items={items}
                onDeleteFolder={onDeleteFolder}
                onRenameFolder={onRenameFolder}
              />
            ) : (
              <BrowserEmptyState
                capabilities={capabilities}
                onCreateFolder={onCreateFolder}
              />
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
