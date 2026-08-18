import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { DataRoomsService } from "./data-rooms.service";

@Controller("data-rooms")
@UseGuards(AuthGuard)
export class DataRoomsController {
  constructor(private readonly dataRoomsService: DataRoomsService) {}

  @Get()
  async listDataRooms(@CurrentUser("id") userId: string) {
    const dataRooms = await this.dataRoomsService.listForOwner(userId);

    return {
      data: {
        dataRooms,
      },
    };
  }

  @Get(":dataRoomId")
  async getDataRoom(
    @CurrentUser("id") userId: string,
    @Param("dataRoomId") dataRoomId: string,
  ) {
    const dataRoom = await this.dataRoomsService.getOwnedDataRoom({
      dataRoomId,
      userId,
    });

    return {
      data: {
        dataRoom,
      },
    };
  }

  @Get(":dataRoomId/contents")
  async getRootContents(
    @CurrentUser("id") userId: string,
    @Param("dataRoomId") dataRoomId: string,
  ) {
    const contents = await this.dataRoomsService.getRootContents({
      dataRoomId,
      userId,
    });

    return {
      data: contents,
    };
  }
}
