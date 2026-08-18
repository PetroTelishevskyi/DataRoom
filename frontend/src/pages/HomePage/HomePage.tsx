import { useQuery } from "@tanstack/react-query";
import { ResourceBrowser } from "@/features/browser/components/resource-browser";
import {
  dataRoomContentsQueryOptions,
  dataRoomsQueryOptions,
} from "@/features/data-rooms/data-room-queries";

export function HomePage() {
  const dataRoomsQuery = useQuery(dataRoomsQueryOptions());
  const dataRoom = dataRoomsQuery.data?.[0] ?? null;
  const contentsQuery = useQuery({
    ...dataRoomContentsQueryOptions(dataRoom?.id ?? ""),
    enabled: Boolean(dataRoom),
  });
  const isLoading =
    dataRoomsQuery.isLoading || (Boolean(dataRoom) && contentsQuery.isLoading);
  const isError = dataRoomsQuery.isError || contentsQuery.isError;
  const items = contentsQuery.data?.items ?? [];
  const breadcrumbTitle = dataRoom?.name ?? "Data Room";

  return (
    <ResourceBrowser
      accessRole={contentsQuery.data?.access.role ?? "OWNER"}
      breadcrumbs={contentsQuery.data?.breadcrumbs ?? []}
      capabilities={{ canCreateFolder: true, canUpload: true }}
      hasResource={Boolean(dataRoom)}
      isError={isError}
      isLoading={isLoading}
      items={items}
      title={breadcrumbTitle}
    />
  );
}
