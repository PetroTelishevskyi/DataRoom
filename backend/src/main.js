"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const frontendUrl = configService.getOrThrow("FRONTEND_URL");
    app.setGlobalPrefix("api/v1");
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.enableShutdownHooks();
    const port = configService.get("PORT", 3000);
    await app.listen(port);
}
void bootstrap();
//# sourceMappingURL=main.js.map