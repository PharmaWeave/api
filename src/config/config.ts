import path from "path";
import dotenv from "dotenv";

export function config() {
    dotenv.config({
        path: path.resolve(__dirname, "../../.env")
    });
}
