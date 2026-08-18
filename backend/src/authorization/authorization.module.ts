import { Module } from "@nestjs/common";
import { ResourceQueryModule } from "../resource-query/resource-query.module";
import { AuthorizationService } from "./authorization.service";

@Module({
  imports: [ResourceQueryModule],
  providers: [AuthorizationService],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
