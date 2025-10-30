import swagger from "swagger-autogen";

const doc = {
    info: {
        title: "My API",
        description: "Description"
    },
    host: "localhost:8080"
};

const output = "./swagger-output.json";
const routes = [
    "../src/user/routes/index.ts",
    "../src/user/routes/employee.ts",
    "../src/user/routes/routes.ts",

    "../src/auth/routes.ts",

    "../src/branch/routes.ts",

    "../src/product/routes.ts",

    "../src/index.ts"
];

swagger()(output, routes, doc);
