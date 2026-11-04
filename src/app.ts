import cors from "cors";
import express, { Request, Response } from "express";
import HTTP_STATUS from "./constants/statusCodes";
import { apiRouter } from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { ResponseBuilder } from "./core/utils/apiResponse";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res
    .status(HTTP_STATUS.OK)
    .json(ResponseBuilder.success("Server is running", undefined, HTTP_STATUS.OK));
});

app.use("/api/v1", apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };
