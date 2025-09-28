import swagger from 'swagger-autogen'

const doc = {
    info: {
        title: 'My API',
        description: 'Description'
    },
    host: 'localhost:3000'
};

const output = './swagger-output.json';
const routes = ['../src/user/routes.ts', '../src/auth/routes.ts']

swagger()(output, routes, doc)
