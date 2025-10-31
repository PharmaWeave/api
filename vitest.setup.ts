import path from "path";
import dotenv from "dotenv";

export default async () => {
    dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
};
