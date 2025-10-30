import express from "express";

import swaggerUi from "swagger-ui-express";
import swaggerFile from "./swagger-output.json";

import type { Request, Response } from "express";

import { connect } from "./database/data-source";
import { config } from "./config/config";

import branch from "@/branch/routes";
import product from "@/product/routes";
import sale from "@/sale/routes";
import promotion from "@/promotion/routes";
import users from "@/user/routes/routes";
import auth from "@/auth/routes";
import { ErrorMiddleware } from "./middlewares/error";

const app = express();
const port = 8080;

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(express.json());

app.use("/branch", branch);
app.use("/product", product);
app.use("/sale", sale);
app.use("/promotion", promotion);
app.use("/user", users);
app.use("/auth", auth);

app.use(ErrorMiddleware);

app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: "Not Found"
    });
});

async function start() {
    try {
        config();
        await connect();

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Starting the Server: ", error);
    }
}

start().catch(error => {
    console.error("Starting the Server: ", error);
});
