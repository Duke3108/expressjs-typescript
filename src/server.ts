import "reflect-metadata";
import express from "express";
import connectDB from "./config/dbConnect.ts";
import cors from "cors";
import cookieParser from "cookie-parser";
import initRoutes from "./routes/index.ts";

const app = express();
const PORT = process.env.PORT || 8888;

app.use(
  cors({
    origin: "*", //TODO: them domain FE
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

initRoutes(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
