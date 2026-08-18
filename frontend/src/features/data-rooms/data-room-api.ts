import { apiRequest } from "@/lib/api";
import type {
  DataRoomContentsResponse,
  DataRoomResponse,
  DataRoomsResponse,
} from "./data-room.types";

export async function listDataRooms() {
  const response = await apiRequest<DataRoomsResponse>("/data-rooms");

  return response.data.dataRooms;
}

export async function getDataRoom(dataRoomId: string) {
  const response = await apiRequest<DataRoomResponse>(
    `/data-rooms/${dataRoomId}`,
  );

  return response.data.dataRoom;
}

export async function getDataRoomContents(dataRoomId: string) {
  const response = await apiRequest<DataRoomContentsResponse>(
    `/data-rooms/${dataRoomId}/contents`,
  );

  return response.data;
}
