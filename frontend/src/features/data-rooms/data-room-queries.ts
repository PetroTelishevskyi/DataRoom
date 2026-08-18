import { queryOptions } from "@tanstack/react-query";
import {
  getDataRoom,
  getDataRoomContents,
  listDataRooms,
} from "./data-room-api";

export const dataRoomQueryKeys = {
  dataRooms: ["dataRooms"] as const,
  room: (roomId: string) => ["dataRoom", roomId] as const,
  roomContents: (roomId: string) =>
    ["dataRoom", roomId, "contents"] as const,
};

export function dataRoomsQueryOptions() {
  return queryOptions({
    queryKey: dataRoomQueryKeys.dataRooms,
    queryFn: listDataRooms,
  });
}

export function dataRoomQueryOptions(dataRoomId: string) {
  return queryOptions({
    queryKey: dataRoomQueryKeys.room(dataRoomId),
    queryFn: () => getDataRoom(dataRoomId),
  });
}

export function dataRoomContentsQueryOptions(dataRoomId: string) {
  return queryOptions({
    queryKey: dataRoomQueryKeys.roomContents(dataRoomId),
    queryFn: () => getDataRoomContents(dataRoomId),
  });
}
