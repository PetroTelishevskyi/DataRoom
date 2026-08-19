import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import { getBrowserCapabilities } from "@/features/browser/browser-capabilities";
import { ResourceBrowser } from "@/features/browser/components/resource-browser";
import { dataRoomContentsQueryOptions } from "@/features/data-rooms/data-room-queries";

type DataRoomLocationState = {
  breadcrumbRootHref?: string;
  breadcrumbRootLabel?: string;
  dataRoomName?: string;
};

function getDataRoomNameFromState(state: unknown) {
  if (
    typeof state === "object" &&
    state !== null &&
    "dataRoomName" in state &&
    typeof state.dataRoomName === "string"
  ) {
    return state.dataRoomName;
  }

  return "Data Room";
}

function getBreadcrumbRootFromState(state: unknown) {
  if (
    typeof state === "object" &&
    state !== null &&
    "breadcrumbRootHref" in state &&
    "breadcrumbRootLabel" in state &&
    typeof state.breadcrumbRootHref === "string" &&
    typeof state.breadcrumbRootLabel === "string"
  ) {
    return {
      href: state.breadcrumbRootHref,
      label: state.breadcrumbRootLabel,
    };
  }

  return null;
}

export function DataRoomPage() {
  const { dataRoomId = "" } = useParams();
  const location = useLocation();
  const contentsQuery = useQuery({
    ...dataRoomContentsQueryOptions(dataRoomId),
    enabled: Boolean(dataRoomId),
  });
  const contents = contentsQuery.data;
  const accessRole = contents?.access.role ?? "VIEWER";
  const title = getDataRoomNameFromState(
    location.state as DataRoomLocationState | null,
  );
  const breadcrumbRoot = getBreadcrumbRootFromState(
    location.state as DataRoomLocationState | null,
  );

  return (
    <ResourceBrowser
      accessRole={accessRole}
      breadcrumbs={contents?.breadcrumbs ?? []}
      capabilities={getBrowserCapabilities(accessRole)}
      dataRoomId={dataRoomId}
      getBreadcrumbHref={(breadcrumb) => `/folders/${breadcrumb.id}`}
      getFolderHref={(folder) => `/folders/${folder.id}`}
      hasResource={Boolean(dataRoomId && contents)}
      isError={contentsQuery.isError}
      isLoading={contentsQuery.isLoading}
      items={contents?.items ?? []}
      rootHref={breadcrumbRoot?.href ?? `/data-rooms/${dataRoomId}`}
      title={breadcrumbRoot?.label ?? title}
    />
  );
}
