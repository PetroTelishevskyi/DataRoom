import { Module } from "@nestjs/common";
import { ResourceQueryService } from "./resource-query.service";

@Module({
  providers: [ResourceQueryService],
  exports: [ResourceQueryService],
})
export class ResourceQueryModule {}
