import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import config from "./config/index.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import modelRoutes from "./routes/modelRoutes.js";
import partRoutes from "./routes/partRoutes.js";
import designRoutes from "./routes/designRoutes.js";
import arPreviewRoutes from "./routes/arPreviewRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/parts", partRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/ar-previews", arPreviewRoutes);

app.use(errorHandler);

export default app;
