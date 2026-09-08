import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import path from "path";
import { connectDB } from "./config/db";
import routes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://offboarding.raiyan.app",
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const cleanOrigin = origin.replace(/\/$/, "");
      const isAllowed = allowedOrigins.some(
        (allowed) => allowed.replace(/\/$/, "") === cleanOrigin
      );
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-user-id",
      "x-role-id",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
