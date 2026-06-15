import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { apiRateLimiter } from "./middlewares/rate-limit.js";
import { attachRequestContext } from "./middlewares/request-context.js";
import { requestLogger } from "./middlewares/request-logger.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(attachRequestContext);
app.use(requestLogger);

app.use("/api", apiRateLimiter);
app.use("/api", apiRouter);

if (env.SERVE_STATIC_FRONTEND || env.NODE_ENV === "production") {
  const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
  const frontendDistPath = path.resolve(currentDirectory, "../../web/dist");

  app.use(express.static(frontendDistPath));
  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);
