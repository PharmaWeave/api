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
    "../src/modules/user/routes/index.ts",
    "../src/modules/user/routes/employee.ts",
    "../src/modules/user/routes/routes.ts",

    "../src/modules/auth/routes.ts",

    "../src/modules/branch/routes.ts",

    "../src/modules/promotion/routes.ts",

    "../src/modules/sale/routes.ts",

    "../src/modules/product/routes.ts",

    "../src/index.ts"
];

swagger()(output, routes, doc);
