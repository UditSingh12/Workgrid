import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { initializeDatabase } from "./data/database.js";

async function bootstrap() {
  try {
    await initializeDatabase();
  } catch (error) {
    logger.error("API bootstrap failed", {
      message: error instanceof Error ? error.message : "Unknown startup error",
    });
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    logger.info("API server started", {
      port: env.PORT,
      environment: env.NODE_ENV,
    });
  });
}

void bootstrap();
